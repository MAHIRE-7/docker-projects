<?php
$host = $_ENV['POSTGRES_HOST'] ?? 'postgres';
$port = $_ENV['POSTGRES_PORT'] ?? '5432';
$dbname = $_ENV['POSTGRES_DB'] ?? 'tasks_db';
$user = $_ENV['POSTGRES_USER'] ?? 'postgres';
$password = $_ENV['POSTGRES_PASSWORD'] ?? 'postgres';

try {
    $pdo = new PDO("pgsql:host=$host;port=$port;dbname=$dbname", $user, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Create table if not exists
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS tasks (
            id SERIAL PRIMARY KEY,
            title VARCHAR(255) NOT NULL,
            description TEXT,
            status VARCHAR(20) DEFAULT 'pending',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ");
} catch (PDOException $e) {
    die("Connection failed: " . $e->getMessage());
}

// Handle API requests
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action'])) {
    header('Content-Type: application/json');
    
    if ($_POST['action'] === 'create') {
        $stmt = $pdo->prepare("INSERT INTO tasks (title, description) VALUES (?, ?)");
        $stmt->execute([$_POST['title'], $_POST['description']]);
        echo json_encode(['success' => true, 'id' => $pdo->lastInsertId()]);
        exit;
    }
    
    if ($_POST['action'] === 'toggle') {
        $stmt = $pdo->prepare("UPDATE tasks SET status = CASE WHEN status = 'pending' THEN 'completed' ELSE 'pending' END WHERE id = ?");
        $stmt->execute([$_POST['id']]);
        echo json_encode(['success' => true]);
        exit;
    }
    
    if ($_POST['action'] === 'delete') {
        $stmt = $pdo->prepare("DELETE FROM tasks WHERE id = ?");
        $stmt->execute([$_POST['id']]);
        echo json_encode(['success' => true]);
        exit;
    }
}

// Get all tasks
if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['api'])) {
    header('Content-Type: application/json');
    $stmt = $pdo->query("SELECT * FROM tasks ORDER BY created_at DESC");
    echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
    exit;
}
?>

<!DOCTYPE html>
<html>
<head>
    <title>PHP Tasks App</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; background: #f5f5f5; }
        .header { text-align: center; margin-bottom: 30px; }
        .task-form { background: white; padding: 25px; border-radius: 10px; margin-bottom: 30px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .form-group { margin-bottom: 15px; }
        .form-group input, .form-group textarea { width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 6px; box-sizing: border-box; }
        .btn { padding: 12px 24px; background: #28a745; color: white; border: none; border-radius: 6px; cursor: pointer; }
        .btn:hover { background: #218838; }
        .tasks { display: grid; gap: 15px; }
        .task { background: white; padding: 20px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .task.completed { opacity: 0.7; background: #f8f9fa; }
        .task h3 { margin: 0 0 10px 0; color: #333; }
        .task p { margin: 0 0 15px 0; color: #666; line-height: 1.5; }
        .task-meta { font-size: 12px; color: #999; margin-bottom: 15px; }
        .task-actions { display: flex; gap: 10px; }
        .btn-toggle { background: #007bff; }
        .btn-toggle:hover { background: #0056b3; }
        .btn-delete { background: #dc3545; }
        .btn-delete:hover { background: #c82333; }
        .status-badge { padding: 4px 12px; border-radius: 15px; font-size: 12px; font-weight: bold; }
        .status-pending { background: #fff3cd; color: #856404; }
        .status-completed { background: #d4edda; color: #155724; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🐘 PHP Tasks App</h1>
        <p>Task management with PHP and PostgreSQL</p>
    </div>

    <div class="task-form">
        <h3>Add New Task</h3>
        <form id="taskForm">
            <div class="form-group">
                <input type="text" id="title" placeholder="Task title" required>
            </div>
            <div class="form-group">
                <textarea id="description" placeholder="Task description" rows="3"></textarea>
            </div>
            <button type="submit" class="btn">Add Task</button>
        </form>
    </div>

    <div id="tasks" class="tasks"></div>

    <script>
        async function loadTasks() {
            const response = await fetch('?api=1');
            const tasks = await response.json();
            const tasksDiv = document.getElementById('tasks');
            
            tasksDiv.innerHTML = tasks.map(task => `
                <div class="task ${task.status}">
                    <h3>${task.title}</h3>
                    ${task.description ? `<p>${task.description}</p>` : ''}
                    <div class="task-meta">
                        <span class="status-badge status-${task.status}">${task.status}</span>
                        Created: ${new Date(task.created_at).toLocaleString()}
                    </div>
                    <div class="task-actions">
                        <button class="btn btn-toggle" onclick="toggleTask(${task.id})">
                            ${task.status === 'pending' ? 'Complete' : 'Reopen'}
                        </button>
                        <button class="btn btn-delete" onclick="deleteTask(${task.id})">Delete</button>
                    </div>
                </div>
            `).join('');
        }

        document.getElementById('taskForm').onsubmit = async (e) => {
            e.preventDefault();
            
            const formData = new FormData();
            formData.append('action', 'create');
            formData.append('title', document.getElementById('title').value);
            formData.append('description', document.getElementById('description').value);
            
            await fetch('', { method: 'POST', body: formData });
            
            document.getElementById('taskForm').reset();
            loadTasks();
        };

        async function toggleTask(id) {
            const formData = new FormData();
            formData.append('action', 'toggle');
            formData.append('id', id);
            
            await fetch('', { method: 'POST', body: formData });
            loadTasks();
        }

        async function deleteTask(id) {
            if (confirm('Delete this task?')) {
                const formData = new FormData();
                formData.append('action', 'delete');
                formData.append('id', id);
                
                await fetch('', { method: 'POST', body: formData });
                loadTasks();
            }
        }

        loadTasks();
    </script>
</body>
</html>