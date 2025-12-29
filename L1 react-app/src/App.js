import React, { useState } from 'react';
import './App.css';

function App() {
  const [count, setCount] = useState(0);
  const [todos, setTodos] = useState([]);
  const [input, setInput] = useState('');

  const addTodo = () => {
    if (input.trim()) {
      setTodos([...todos, { id: Date.now(), text: input, done: false }]);
      setInput('');
    }
  };

  const toggleTodo = (id) => {
    setTodos(todos.map(todo => 
      todo.id === id ? { ...todo, done: !todo.done } : todo
    ));
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>🐳 React Docker App</h1>
        <div className="badge">Running in Container</div>
      </header>

      <div className="container">
        <div className="card">
          <h2>Counter</h2>
          <div className="counter">
            <button onClick={() => setCount(count - 1)}>-</button>
            <span>{count}</span>
            <button onClick={() => setCount(count + 1)}>+</button>
          </div>
        </div>

        <div className="card">
          <h2>Todo List</h2>
          <div className="todo-input">
            <input 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addTodo()}
              placeholder="Add a todo..."
            />
            <button onClick={addTodo}>Add</button>
          </div>
          <div className="todos">
            {todos.map(todo => (
              <div key={todo.id} className={`todo ${todo.done ? 'done' : ''}`}>
                <span onClick={() => toggleTodo(todo.id)}>{todo.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;