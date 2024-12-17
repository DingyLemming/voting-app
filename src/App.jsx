import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import './App.css';
import { registerUser, loginUser } from './services/Auth';
import { createPoll, getPolls, deletePoll, voteOnPoll, setAuthToken } from './services/Polls';

function App() {
  const [userRole, setUserRole] = React.useState(localStorage.getItem('userRole'));
  const [token, setToken] = React.useState(localStorage.getItem('token'));

  React.useEffect(() => {
    const savedToken = localStorage.getItem('token');
    if (savedToken) {
      setToken(savedToken); // Update React state
      setAuthToken(savedToken); // Ensure Axios headers are updated
    }
  }, []);

  // Sync userRole with localStorage
  React.useEffect(() => {
    if (userRole) {
      localStorage.setItem('userRole', userRole);
    }
  }, [userRole]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole'); // Clear userRole on logout
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
          <Route path="/vote" element={token ? <Vote userRole={userRole} /> : <Navigate to="/login" />} />
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
      setAuthToken(data.token);
      localStorage.setItem('userRole', data.role);
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

function Vote({ userRole }) {
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
    if (userRole !== 'user') {
      alert('Only users can vote.');
      return;
    }
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
            <button
              key={option._id}
              onClick={() => handleVote(poll._id, option._id)}
              disabled={userRole !== 'user'}
            >
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
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    const fetchPolls = async () => {
      try {
        const { data } = await getPolls();
        setPolls(data);
        console.log('Fetched polls:', data);
      } catch (error) {
        setError(error.response?.data?.message || 'Error fetching polls');
        console.error('Error fetching polls:', error.response?.data?.message || error.message);
        console.log('Fetch polls error details:', error);
      }
    };

    fetchPolls();
  }, []);

  const handleAddPoll = async () => {
    try {
      const pollData = { question: newQuestion, options: newOptions.map((opt) => ({ name: opt })) };
      console.log('Creating poll with data:', pollData);
  
      const { data } = await createPoll(pollData);
      console.log('Poll created successfully:', data);
  
      // Add the new poll to the state
      setPolls((prevPolls) => [...prevPolls, data.poll]);
  
      // Reset the form
      setNewQuestion('');
      setNewOptions(['']);
    } catch (error) {
      setError(error.response?.data?.message || 'Error creating poll');
      console.error('Error creating poll:', error.response?.data?.message || error.message);
    }
  };
  

  const handleDeletePoll = async (pollId) => {
    try {
      console.log('Deleting poll with ID:', pollId);
      await deletePoll(pollId);
      setPolls((prevPolls) => prevPolls.filter((poll) => poll._id !== pollId));
      console.log('Poll deleted successfully');
    } catch (error) {
      setError(error.response?.data?.message || 'Error deleting poll');
      console.error('Error deleting poll:', error.response?.data?.message || error.message);
      console.log('Delete poll error details:', error);
    }
  };

  return (
    <div>
      <h2>Admin Dashboard</h2>
      {error && <p className="error-message">{error}</p>}
      <div>
        <h3>Create New Poll</h3>
        <label>
          Question:
          <input
            type="text"
            value={newQuestion}
            onChange={(e) => setNewQuestion(e.target.value)}
          />
        </label>
        <div>
          <h4>Options:</h4>
          {newOptions.map((option, index) => (
            <div key={index}>
              <label>
                Option {index + 1}:
                <input
                  type="text"
                  value={option}
                  onChange={(e) =>
                    setNewOptions(newOptions.map((opt, i) => (i === index ? e.target.value : opt)))
                  }
                />
              </label>
            </div>
          ))}
        </div>
        <button onClick={() => setNewOptions([...newOptions, ''])}>Add Option</button>
        <button onClick={handleAddPoll}>Create Poll</button>
      </div>
      <div>
      <h3>Existing Polls</h3>
      {polls && polls.length > 0 ? (
        polls.map((poll) => (
          <div key={poll._id}>
            <h4>{poll.question}</h4>
            {poll.options?.map((option) => (
              <p key={option._id}>
                {option.name} ({option.votes})
              </p>
            ))}
            <button onClick={() => handleDeletePoll(poll._id)}>Delete Poll</button>
          </div>
        ))
      ) : (
        <p>No polls available.</p>
      )}
    </div>
    </div>
  );
}
export default App;
