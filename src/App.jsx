import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import './App.css';
import { registerUser, loginUser } from './services/Auth';
import { createPoll, getPolls, deletePoll, voteOnPoll, setAuthToken } from './services/Polls';

function App() {
  const [userRole, setUserRole] = React.useState(null); 
  const [token, setToken] = React.useState(localStorage.getItem('token'));

  React.useEffect(() => {
    if (token) {
      setAuthToken(token);
    }
  }, [token]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUserRole(null);
    setAuthToken(null);
  };

  return (
    <Router>
      <div className="App">
        <header>
          <h1>Voting App</h1>
          <nav>
            <Link to="/">Home</Link>
            {token ? (
              <>
                <Link to="/vote">Vote</Link>
                {userRole === "admin" && <Link to="/admin">Admin</Link>}
                <button onClick={handleLogout}>Logout</button>
              </>
            ) : (
              <>
                <Link to="/login">Login</Link>
                <Link to="/register">Register</Link>
              </>
            )}
          </nav>
        </header>

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login setUserRole={setUserRole} setToken={setToken} />} />
          <Route path="/register" element={<Register />} />
          <Route path="/vote" element={token ? <Vote /> : <Navigate to="/login" />} />
          <Route path="/admin" element={userRole === "admin" ? <AdminDashboard /> : <Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  );
}

function Home() {
  return (
    <div>
      <h2>Welcome to the Voting App</h2>
      <p>Login or register to participate in voting!</p>
    </div>
  );
}

function Login({ setUserRole, setToken }) {
  const handleLogin = async (e) => {
    e.preventDefault();
    const username = e.target.username.value;
    const password = e.target.password.value;

    try {
      const { data } = await loginUser({ username, password });
      localStorage.setItem('token', data.token);
      setToken(data.token);
      setUserRole(data.role);
    } catch (error) {
      console.error('Login failed:', error.response?.data.message || error.message);
    }
  };

  return (
    <div>
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <label>
          Username:
          <input type="text" name="username" required />
        </label>
        <label>
          Password:
          <input type="password" name="password" required />
        </label>
        <button type="submit">Login</button>
      </form>
    </div>
  );
}

function Register() {
  const handleRegister = async (e) => {
    e.preventDefault();
    const username = e.target.username.value;
    const password = e.target.password.value;
    const role = e.target.role.value;

    try {
      await registerUser({ username, password, role });
      alert('Registration successful!');
    } catch (error) {
      console.error('Registration failed:', error.response?.data.message || error.message);
    }
  };

  return (
    <div>
      <h2>Register</h2>
      <form onSubmit={handleRegister}>
        <label>
          Username:
          <input type="text" name="username" required />
        </label>
        <label>
          Password:
          <input type="password" name="password" required />
        </label>
        <label>
          Role:
          <select name="role">
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
        </label>
        <button type="submit">Register</button>
      </form>
    </div>
  );
}

function Vote() {
  const [polls, setPolls] = React.useState([]);

  React.useEffect(() => {
    const fetchPolls = async () => {
      try {
        const { data } = await getPolls();
        setPolls(data);
      } catch (error) {
        console.error('Error fetching polls:', error.response?.data.message || error.message);
      }
    };
    fetchPolls();
  }, []);

  const handleVote = async (pollId, optionId) => {
    try {
      await voteOnPoll(pollId, optionId);
      alert('Vote recorded successfully!');
    } catch (error) {
      console.error('Error voting:', error.response?.data.message || error.message);
    }
  };

  return (
    <div>
      <h2>Vote</h2>
      {polls.map((poll) => (
        <div key={poll._id}>
          <h4>{poll.question}</h4>
          {poll.options.map((option) => (
            <button key={option._id} onClick={() => handleVote(poll._id, option._id)}>
              {option.name} ({option.votes})
            </button>
          ))}
        </div>
      ))}
    </div>
  );
}

function AdminDashboard() {
  const [polls, setPolls] = React.useState([]);
  const [newQuestion, setNewQuestion] = React.useState('');
  const [newOptions, setNewOptions] = React.useState(['']);

  React.useEffect(() => {
    const fetchPolls = async () => {
      try {
        const { data } = await getPolls();
        setPolls(data);
      } catch (error) {
        console.error('Error fetching polls:', error.response?.data.message || error.message);
      }
    };
    fetchPolls();
  }, []);

  const handleAddPoll = async () => {
    try {
      const pollData = { question: newQuestion, options: newOptions };
      const { data } = await createPoll(pollData);
      setPolls([...polls, data]);
      setNewQuestion('');
      setNewOptions(['']);
    } catch (error) {
      console.error('Error creating poll:', error.response?.data.message || error.message);
    }
  };

  const handleDeletePoll = async (pollId) => {
    try {
      await deletePoll(pollId);
      setPolls(polls.filter((poll) => poll._id !== pollId));
    } catch (error) {
      console.error('Error deleting poll:', error.response?.data.message || error.message);
    }
  };

  return (
    <div>
      <h2>Admin Dashboard</h2>
      <div>
        <h3>Create New Poll</h3>
        <label>
          Question:
        </label>
        {newOptions.map((option, index) => (
          <input
            key={index}
            type="text"
            value={option}
            onChange={(e) =>
              setNewOptions(newOptions.map((opt, i) => (i === index ? e.target.value : opt)))
            }
          />
        ))}
        <button onClick={() => setNewOptions([...newOptions, ''])}>Add Option</button>
        <button onClick={handleAddPoll}>Create Poll</button>
      </div>
      <div>
        <h3>Existing Polls</h3>
        {polls.map((poll) => (
          <div key={poll._id}>
            <h4>{poll.question}</h4>
            {poll.options.map((option) => (
              <p key={option._id}>{option.name} ({option.votes})</p>
            ))}
            <button onClick={() => handleDeletePoll(poll._id)}>Delete Poll</button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
