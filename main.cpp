#include <iostream>
#include <string>
#include <winsock2.h>
#include <fstream>
#include <sstream>

#pragma comment(lib, "ws2_32.lib")

using namespace std;

string getFileContent(const string& filename) {
    ifstream file(filename);
    if (!file.is_open()) return "";
    string content((istreambuf_iterator<char>(file)), istreambuf_iterator<char>());
    return content;
}

int main() {
    WSADATA wsaData;
    if (WSAStartup(MAKEWORD(2, 2), &wsaData) != 0) {
        cout << "WSAStartup failed." << endl;
        return 1;
    }

    SOCKET listenSocket = socket(AF_INET, SOCK_STREAM, IPPROTO_TCP);
    if (listenSocket == INVALID_SOCKET) {
        cout << "Error creating socket." << endl;
        WSACleanup();
        return 1;
    }

    sockaddr_in serverAddr;
    serverAddr.sin_family = AF_INET;
    serverAddr.sin_addr.s_addr = INADDR_ANY;
    serverAddr.sin_port = htons(8080); // Serving on port 8080

    if (bind(listenSocket, (sockaddr*)&serverAddr, sizeof(serverAddr)) == SOCKET_ERROR) {
        cout << "Bind failed. Port might be in use." << endl;
        closesocket(listenSocket);
        WSACleanup();
        return 1;
    }

    if (listen(listenSocket, SOMAXCONN) == SOCKET_ERROR) {
        cout << "Listen failed." << endl;
        closesocket(listenSocket);
        WSACleanup();
        return 1;
    }

    cout << "========================================" << endl;
    cout << "  C++ SMART BOOKING SERVER RUNNING!" << endl;
    cout << "  Open this link in your browser: " << endl;
    cout << "  http://localhost:8080 " << endl;
    cout << "========================================" << endl;

    // A simple blocking loop to handle connections
    while (true) {
        SOCKET clientSocket = accept(listenSocket, NULL, NULL);
        if (clientSocket == INVALID_SOCKET) {
            continue;
        }

        char buffer[2048] = {0};
        recv(clientSocket, buffer, 2048, 0);
        
        string req(buffer);
        string url = "/";
        if (req.length() > 3 && req.substr(0, 3) == "GET") {
            size_t start = req.find(' ') + 1;
            size_t end = req.find(' ', start);
            url = req.substr(start, end - start);
        }

        string contentType = "text/html";
        string filePath = "";

        if (url == "/") {
            filePath = "index.html";
        } else if (url == "/style.css") {
            filePath = "style.css";
            contentType = "text/css";
        } else if (url == "/script.js") {
            filePath = "script.js";
            contentType = "application/javascript";
        } else if (url.find("/assets/hero.png") != string::npos) {
            filePath = "assets/hero.png";
            contentType = "image/png";
        }

        string content;
        if (filePath != "") {
            if (contentType == "image/png") {
                // Read binary file
                ifstream f(filePath, ios::binary);
                if(f) {
                    ostringstream ostrm;
                    ostrm << f.rdbuf();
                    content = ostrm.str();
                }
            } else {
                content = getFileContent(filePath);
            }
        }

        string response;
        if (content.empty()) {
            response = "HTTP/1.1 404 Not Found\r\nConnection: close\r\n\r\n";
        } else {
            stringstream ss;
            ss << "HTTP/1.1 200 OK\r\n";
            ss << "Content-Type: " << contentType << "\r\n";
            ss << "Content-Length: " << content.size() << "\r\n";
            ss << "Connection: close\r\n\r\n";
            response = ss.str() + content;
        }

        send(clientSocket, response.c_str(), response.size(), 0);
        closesocket(clientSocket);
    }

    closesocket(listenSocket);
    WSACleanup();
    return 0;
}
