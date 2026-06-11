#include <iostream>
#include <vector>
#include <unordered_map>
#include <queue>
#include <algorithm>
#include <string>
#include <set> 
#include <emscripten/bind.h>

using namespace std;
using namespace emscripten;

struct SimResult {
    vector<int> path;
    int cost;
    string message;
    string matrix;
};

class Graph {
    unordered_map<int, vector<pair<int, int>>> adj;
    int V = 0; 
    set<int> allNodes; 

public:
    void addEdge(int u, int v, int weight) {
        adj[u].push_back({v, weight});
        V = max({V, u + 1, v + 1}); 
        allNodes.insert(u); 
        allNodes.insert(v); 
    }

    void deleteNode(int node) {
        adj.erase(node);
        allNodes.erase(node);
        for (auto& pair : adj) {
            auto& neighbors = pair.second;
            neighbors.erase(
                remove_if(neighbors.begin(), neighbors.end(), 
                [node](const std::pair<int, int>& edge) { return edge.first == node; }), 
                neighbors.end()
            );
        }
    }

    SimResult dijkstra(int start, int end) {
        unordered_map<int, int> dist, parent;
        for (int node : allNodes) dist[node] = 1e9; // Safely initialize ALL nodes
        
        priority_queue<pair<int, int>, vector<pair<int, int>>, greater<>> pq;
        dist[start] = 0;
        pq.push({0, start});
        parent[start] = -1;

        while (!pq.empty()) {
            int u = pq.top().second;
            pq.pop();
            if (u == end) break;

            for (auto& edge : adj[u]) {
                int v = edge.first, w = edge.second;
                if (dist[u] + w < dist[v]) {
                    dist[v] = dist[u] + w;
                    parent[v] = u;
                    pq.push({dist[v], v});
                }
            }
        }
        
        vector<int> path = reconstructPath(parent, start, end);
        int cost = (dist[end] == 1e9) ? -1 : dist[end];
        return {path, cost, "SUCCESS", ""};
    }

    SimResult bellmanFord(int start, int end) {
        unordered_map<int, int> dist, parent;
        for (int node : allNodes) dist[node] = 1e9;
        dist[start] = 0;
        parent[start] = -1;

        int numNodes = allNodes.size(); // THE FIX: Get exact unique node count
        
        // Relax V - 1 times
        for (int i = 0; i < numNodes - 1; i++) {
            for (auto& pair : adj) {
                int u = pair.first;
                for (auto& edge : pair.second) {
                    int v = edge.first, w = edge.second;
                    if (dist[u] != 1e9 && dist[u] + w < dist[v]) {
                        dist[v] = dist[u] + w;
                        parent[v] = u;
                    }
                }
            }
        }

        // Check for Negative Cycle
        for (auto& pair : adj) {
            int u = pair.first;
            for (auto& edge : pair.second) {
                int v = edge.first, w = edge.second;
                if (dist[u] != 1e9 && dist[u] + w < dist[v]) {
                    return {{}, -1, "ERROR: NEGATIVE WEIGHT CYCLE DETECTED", ""};
                }
            }
        }

        vector<int> path = reconstructPath(parent, start, end);
        int cost = (dist[end] == 1e9) ? -1 : dist[end];
        return {path, cost, "SUCCESS", ""};
    }

    string pad(string s, int width = 7) {
        if (s.length() < width) return s + string(width - s.length(), ' ');
        return s;
    }

    SimResult floydWarshall(int start, int end) {
        if (V == 0) return {{}, -1, "Graph is empty", ""};
        
        vector<vector<int>> dist(V, vector<int>(V, 1e9));
        vector<vector<int>> nextNode(V, vector<int>(V, -1));

        for (int node : allNodes) dist[node][node] = 0;

        for (auto& pair : adj) {
            int u = pair.first;
            for (auto& edge : pair.second) {
                if (edge.second < dist[u][edge.first]) {
                    dist[u][edge.first] = edge.second;
                    nextNode[u][edge.first] = edge.first;
                }
            }
        }

        for (int k = 0; k < V; k++) {
            for (int i = 0; i < V; i++) {
                for (int j = 0; j < V; j++) {
                    if (dist[i][k] != 1e9 && dist[k][j] != 1e9 && dist[i][k] + dist[k][j] < dist[i][j]) {
                        dist[i][j] = dist[i][k] + dist[k][j];
                        nextNode[i][j] = nextNode[i][k];
                    }
                }
            }
        }

        vector<int> activeNodes(allNodes.begin(), allNodes.end());
        string matrixStr = "      | ";
        for(int node : activeNodes) matrixStr += pad(to_string(node));
        matrixStr += "\n" + string(8 + activeNodes.size() * 7, '-') + "\n";
        
        for(int i : activeNodes) {
            matrixStr += pad(to_string(i), 5) + " | ";
            for(int j : activeNodes) {
                if (dist[i][j] == 1e9) matrixStr += pad("INF");
                else matrixStr += pad(to_string(dist[i][j]));
            }
            matrixStr += "\n";
        }

        vector<int> path;
        if (start < V && end < V && nextNode[start][end] != -1) {
            int curr = start;
            path.push_back(curr);
            while (curr != end) {
                curr = nextNode[curr][end];
                path.push_back(curr);
            }
        }
        
        int cost = (start < V && end < V && dist[start][end] != 1e9) ? dist[start][end] : -1;
        return {path, cost, "MATRIX GENERATED", matrixStr};
    }

private:
    vector<int> reconstructPath(unordered_map<int, int>& parent, int start, int end) {
        vector<int> path;
        if (parent.find(end) == parent.end()) return path;
        for (int at = end; at != -1; at = parent[at]) path.push_back(at);
        reverse(path.begin(), path.end());
        if (path.front() != start) path.clear(); 
        return path;
    }
};

EMSCRIPTEN_BINDINGS(graph_module) {
    value_object<SimResult>("SimResult")
        .field("path", &SimResult::path)
        .field("cost", &SimResult::cost)
        .field("message", &SimResult::message)
        .field("matrix", &SimResult::matrix);

    class_<Graph>("Graph")
        .constructor<>()
        .function("addEdge", &Graph::addEdge)
        .function("deleteNode", &Graph::deleteNode)
        .function("dijkstra", &Graph::dijkstra)
        .function("bellmanFord", &Graph::bellmanFord)
        .function("floydWarshall", &Graph::floydWarshall);
    
    register_vector<int>("VectorInt");
}