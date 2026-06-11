export const nodeStyle = { 
  background: 'linear-gradient(135deg, #8b5cf6 0%, #d946ef 100%)', 
  color: '#ffffff', 
  fontWeight: '800',
  fontSize: '16px',
  border: '2px solid rgba(255, 255, 255, 0.2)', 
  borderRadius: '50%', 
  boxShadow: '0 8px 20px -4px rgba(217, 70, 239, 0.4)', 
  width: 50, height: 50, display: 'flex', justifyContent: 'center', alignItems: 'center' 
};


export const codeSnippets = {
  dijkstra: `vector<int> dijkstra(int start, int end) {
    unordered_map<int, int> dist, parent;
    priority_queue<pair<int, int>, vector<pair<int, int>>, greater<>> pq;
    for(auto node : nodes) dist[node] = 1e9;
    dist[start] = 0;
    pq.push({0, start});
    while (!pq.empty()) {
        int u = pq.top().second;
        pq.pop();
        for (auto& edge : adj[u]) {
            int v = edge.first, w = edge.second;
            if (dist[u] + w < dist[v]) {
                dist[v] = dist[u] + w;
                parent[v] = u;
                pq.push({dist[v], v});
            }
        }
    }
    return reconstructPath(parent, start, end);
}`,

  bellman: `vector<int> bellmanFord(int start, int end) {
    unordered_map<int, int> dist;
    dist[start] = 0;
    for (int i = 0; i < V - 1; i++) {
        for (auto& pair : adj) {
            int u = pair.first;
            for (auto& edge : pair.second) {
                int v = edge.first, w = edge.second;
                if (dist[u] != 1e9 && dist[u] + w < dist[v]) {
                    dist[v] = dist[u] + w;
                }
            }
        }
    }
    return path;
}`,

  floyd: `vector<int> floydWarshall(int start, int end) {
    vector<vector<int>> dist(V, vector<int>(V, 1e9));
    for(int i=0; i<V; i++) dist[i][i] = 0;
    for (int k = 0; k < V; k++) {
        for (int i = 0; i < V; i++) {
            for (int j = 0; j < V; j++) {
                if (dist[i][k] != 1e9 && dist[k][j] != 1e9 && dist[i][k] + dist[k][j] < dist[i][j]) {
                    dist[i][j] = dist[i][k] + dist[k][j];
                }
            }
        }
    }
    return path;
}`,

  compare: ``
};

export const DEFAULT_GRAPH_INPUT = `10 20
1 2 5
1 3 2
2 4 1
2 5 7
3 5 3
3 6 4
4 7 8
5 7 2
5 8 6
6 8 3
6 9 1
7 10 9
8 10 2
9 10 5
1 4 6
2 6 8
3 2 1
4 8 4
7 9 3
8 9 2`;