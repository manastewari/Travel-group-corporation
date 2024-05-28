const express = require('express');
//////revert back
const cors = require('cors');
const mysql = require('mysql');
//css other files///
const path = require('path'); 

// Create an Express application
const app = express();
app.set('view engine', 'ejs');

const port = 3000;
app.use(express.static(path.join(__dirname, 'public')));
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'front.html'));
});
app.use(cors());
// Create a MySQL connection
let connection;

try {
  connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Zaq!2wsx',
    database: 'event_management'
  });


  // Connect to MySQL
  connection.connect((err) => {
    if (err) {
      console.error('Error connecting to MySQL: ', err);
      return;
    }
    console.log('Connected to MySQL');
  });
} catch (err) {
  console.error('Error establishing MySQL connection: ', err);
  process.exit(1); // Exit the Node.js process with status 1 indicating failure
}

// Set up middleware to parse request body
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Serve static files (if needed)
app.use(express.static('public'));
// Route to handle login
// Route to handle user registration
app.post('/register', (req, res) => {
  const { name, email, password } = req.body;

  // Insert user data into MySQL database
  const query = 'INSERT INTO users (username, email, password) VALUES (?, ?, ?)';
  connection.query(query, [name, email, password], (err, results) => {
    if (err) {
      console.error('Error inserting data into MySQL: ', err);
      res.status(500).send('Internal Server Error');
      return;
    }
    console.log('User data inserted into MySQL');
    res.status(200).send('User registered successfully');
  });
});
// Route to handle user login

// Route to handle user login and serve the host or index page
// Route to handle user login and serve the host or index page
app.post('/login', (req, res) => {
  const { email, password } = req.body;

  // Query the database to find the user with the provided email and password
  const query = 'SELECT * FROM users WHERE email = ? AND password = ?';
  connection.query(query, [email, password], (err, results) => {
    if (err) {
      console.error('Error querying database: ', err);
      res.status(500).send('Internal Server Error');
      return;
    }

    // If no user found with the provided email and password
    if (results.length === 0) {
      res.status(401).send('Invalid email or password');
      return;
    }

    const userId = results[0].user_id;

    // Redirect to the host_selection.html page with userId as a query parameter
    res.redirect(`/host_selection.html?userId=${userId}`);
  });
}); // <- Missing closing bracket

// Route to serve the host or index page based on selection
app.post('/select_page', (req, res) => {
  const selectedPage = req.body.page;
  const userId = req.body.userId;

  // If index.html is selected, redirect to index.html with userId
  if (selectedPage === 'dashboard') {
    res.redirect(`/dashboard.html?userId=${userId}`);
  } else if (selectedPage === 'index') {
    res.redirect(`/index.html?userId=${userId}`);
  } else if (selectedPage === 'host') {
    res.redirect(`/host.html?userId=${userId}`);
  } else {
    // Handle invalid selection
    res.status(400).send('Invalid selection');
  }
});

// Route to serve the host.html page
app.get('/host.html', (req, res) => {
  const userId = req.query.userId; // Get userId from query parameters
  res.sendFile(path.join(__dirname, 'host.html'));
});

// Route to serve the index.html page
app.get('/index.html', (req, res) => {
  const userId = req.query.userId; // Get userId from query parameters
  res.sendFile(path.join(__dirname, 'index.html'));
});


app.get('/host_selection.html', (req, res) => {
  const userId = req.query.userId; // Get userId from query parameters
  res.sendFile(path.join(__dirname, 'host_selection.html'));
});
app.get('/dashboard.html', (req, res) => {
  const userId = req.query.userId; // Get userId from query parameters
  res.sendFile(path.join(__dirname, 'dashboard.html'));
});

// Define a route to handle form submission
app.post('/submit-form', (req, res) => {
  const formData = req.body;
  const userId = req.query.userId; // Get userId from query parameters

  const query = 'INSERT INTO events (host_user_id, title, category, description, start_date, end_date, start_time, city, address, share_address, max_participants, min_age, other_requirements, approximate_cost, rules_guidelines, event_image) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';

  connection.query(query, [
    userId, // Correctly placing userId as the first value
    formData['event-title'], 
    formData.category, 
    formData.desc, 
    formData['start-d'], 
    formData['end-d'], 
    formData['start-t'], 
    formData.city, 
    formData.add, 
    formData.showadd === 'on' ? 1 : 0, // Checkbox handling: 'on' if checked, otherwise not present
    formData.quantity, 
    formData.age, 
    formData['other-req'], 
    formData.cost, 
    formData.rules, // Assuming there's a mistake since you've used name="desc" twice in your HTML
    formData['event-img'], // This will not work for file uploads as is; handling files requires different middleware
  ], (err, results) => {
    if (err) {
      console.error('Error inserting data into MySQL: ', err);
      res.status(500).send('Internal Server Error');
      return;
    }
    console.log('Form data inserted into MySQL');
    res.status(200).send('Form data submitted successfully');
  });
});

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/host.html');
});

//for css////////////////
app.use(express.static(path.join(__dirname, 'public')));
/////////////////////////

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});


///////////////////////////////////////////////////////Revert back//////////////////////////////////
app.get('/events', (req, res) => {
  let sqlQuery = "SELECT * FROM events WHERE display_status = 1"; // Modify the query
  connection.query(sqlQuery, (err, result) => {
    if (err) {
      console.error("Error retrieving data from MySQL:", err);
      res.status(500).send("An error occurred while retrieving data.");
      return;
    }
    
    res.json(result); // Send the result set as JSON response
  });
});


// Handle specific event details based on ID
app.get('/event/:id', (req, res) => {
  const id = parseInt(req.params.id);
  let sqlQuery = "SELECT * FROM events WHERE id=?";
  connection.query(sqlQuery, [id], (err, result) => {
    if (err || !result[0]) {
      console.error("Event not found or error retrieving data from MySQL:", err);
      res.status(404).send("Event not found");
      return;
    }
    
    res.json(result[0]); // Send the single row result as JSON response
  });
});
//////////////////////
app.post('/event/:id/register', (req, res) => {
  const eventId = parseInt(req.params.id);
  const { userId } = req.body; // Assuming you have userId in request body

  // Ensure eventId is a number
  if (isNaN(eventId)) {
    res.status(400).send("Invalid event ID.");
    return;
  }

  // Check if the user has already registered for the event
  const checkQuery = "SELECT status FROM event_joins WHERE event_id = ? AND joiner_user_id = ?";
  connection.query(checkQuery, [eventId, userId], (checkErr, checkResult) => {
    if (checkErr) {
      console.error("Error checking event join:", checkErr);
      res.status(500).send("An error occurred while checking event join.");
      return;
    }

    // If the user is already registered for the event
    if (checkResult.length > 0) {
      const status = checkResult[0].status;
      if (status === 'accepted') {
        res.status(400).send("You are already registered for the event.");
      } else if (status === 'pending') {
        res.status(400).send("Your registration is pending approval from the host.");
      } else if (status === 'rejected') {
        res.status(400).send("Your registration has been rejected by the host.");
      }
      return;
    }

    // Proceed with registration if the user is not already registered
    // Insert participant registration into the database with status "pending"
    const sqlQuery = "INSERT INTO event_joins (event_id, joiner_user_id, status, join_date) VALUES (?, ?, 'pending', NOW())";
    connection.query(sqlQuery, [eventId, userId], (insertErr, insertResult) => {
      if (insertErr) {
        console.error("Error inserting registration data into MySQL:", insertErr);
        res.status(500).send("An error occurred while registering for the event.");
        return;
      }
      res.status(200).send("Registration request submitted. Waiting for approval from the host.");
    });
  });
});


app.get('/dashboard/data', (req, res) => {
  const userId = req.query.userId;

 const sqlHostedWithJoiners = `
    SELECT
      e.*,
      ed.joiner_usernames,
      ed.joiner_emails,
      ed.joiner_ids
    FROM
      events e
    LEFT JOIN
      event_details ed ON e.event_id = ed.event_id
    WHERE
      e.host_user_id = ?
`;

  const sqlJoinedWithStatus = `
  SELECT 
    e.*, 
    u.username AS host_username, 
    u.email AS host_email,
    ej.status AS join_status
  FROM 
    events e
  JOIN 
    event_joins ej ON e.event_id = ej.event_id
  JOIN 
    users u ON e.host_user_id = u.user_id
  WHERE 
    ej.joiner_user_id = ?
`;

connection.query(sqlHostedWithJoiners, [userId], (errHosted, hostedEvents) => {
  if (errHosted) {
    console.error('Error fetching hosted events with joiners: ', errHosted);
    res.status(500).json({ error: 'Internal Server Error' });
    return;
  }

  connection.query(sqlJoinedWithStatus, [userId], (errJoined, joinedEvents) => {
    if (errJoined) {
      console.error('Error fetching joined events: ', errJoined);
      res.status(500).json({ error: 'Internal Server Error' });
      return;
    }

    // Iterate through joined events to determine the status
    joinedEvents.forEach(event => {
      if (event.join_status === 'pending') {
        event.status = 'pending';
      } else {
        event.status = 'accepted';
      }
    });

    // Return the fetched data as JSON response
    res.json({ hostedEvents, joinedEvents });
  });
});

// Route to handle accepting a joiner
app.post('/accept-joiner', (req, res) => {
  const { eventId, joinerId } = req.body;

  // Update the status of the joiner to 'accepted'
  const sql = 'UPDATE event_joins SET status = ? WHERE event_id = ? AND joiner_user_id = ?';
  const status = 'accepted';

  connection.query(sql, [status, eventId, joinerId], (err, result) => {
    if (err) {
      console.error('Error accepting joiner:', err);
      res.status(500).json({ error: 'Internal Server Error' });
      return;
    }
    console.log('Joiner accepted successfully');
    res.status(200).json({ status: 'accepted' }); // Send status as accepted
  });
});

// Route to handle accepting all joiners for an event
app.post('/accept-all-joiners', (req, res) => {
  const { eventId } = req.body;

  // Update the status of all joiners for the event to 'accepted'
  const sql = 'UPDATE event_joins SET status = ? WHERE event_id = ?';
  const status = 'accepted';

  connection.query(sql, [status, eventId], (err, result) => {
    if (err) {
      console.error('Error accepting all joiners:', err);
      res.status(500).json({ error: 'Internal Server Error' });
      return;
    }
    console.log('All joiners accepted successfully');
    res.status(200).json({ status: 'accepted' }); // Send status as accepted
  });
});

 
// Route to handle removal of joiner from an event
app.post('/remove-joiner', (req, res) => {
  const { eventId, joinerId } = req.body;

  // Remove joiner from event_joins table
  const sql = 'DELETE FROM event_joins WHERE event_id = ? AND joiner_user_id = ?';

  connection.query(sql, [eventId, joinerId], (err, result) => {
    if (err) {
      console.error('Error removing joiner:', err);
      res.status(500).json({ error: 'Internal Server Error' });
      return;
    }
    console.log('Joiner removed successfully');
    res.status(200).json({ status: 'removed' }); // Send status as removed
  });
});

// Route to handle removing a user from an event
app.post('/event/:eventId/remove/:userId', (req, res) => {
  const eventId = parseInt(req.params.eventId);
  const userId = parseInt(req.params.userId);

  // Ensure eventId and userId are numbers
  if (isNaN(eventId) || isNaN(userId)) {
    res.status(400).send("Invalid event ID or user ID.");
    return;
  }

  // Delete the entry from event_joins table
  const sqlQuery = "DELETE FROM event_joins WHERE event_id = ? AND joiner_user_id = ?";
  connection.query(sqlQuery, [eventId, userId], (err, result) => {
    if (err) {
      console.error("Error removing user from event:", err);
      res.status(500).send("An error occurred while removing user from the event.");
      return;
    }

    if (result.affectedRows === 0) {
      // If no rows were affected, it means the user was not found in the event
      res.status(404).send("User not found in the event.");
      return;
    }

    // User successfully removed from the event
    res.status(200).send("User removed from the event successfully.");
  });
});


// Route to handle removal of an event
app.post('/remove-event', (req, res) => {
  const { eventId } = req.body;

  // Ensure eventId is a number
  if (isNaN(eventId)) {
    res.status(400).json({ error: 'Invalid event ID.' });
    return;
  }

  // Delete the event from the events table
  const sqlQuery = "DELETE FROM events WHERE event_id = ?";
  connection.query(sqlQuery, [eventId], (err, result) => {
    if (err) {
      console.error("Error removing event:", err);
      res.status(500).json({ error: 'Internal Server Error' });
      return;
    }

    if (result.affectedRows === 0) {
      // If no rows were affected, it means the event with the given ID was not found
      res.status(404).json({ error: 'Event not found.' });
      return;
    }

    // Event successfully removed
    res.status(200).json({ status: 'removed' });
  });
});



// File system operations

});
const fs = require('fs');

const htmlPath = 'C:\Users\manas\Desktop\planner website\index.html';
const serverPath = 'C:\Users\manas\Desktop\planner website\server.js';

fs.access(htmlPath, fs.constants.F_OK, (err) => {
  if (err) {
    console.error(`${htmlPath} does not exist`);
  } else {
    console.log(`${htmlPath} exists`);
  }
});

fs.access(serverPath, fs.constants.F_OK, (err) => {
  if (err) {
    console.error(`${serverPath} does not exist`);
  } else {
    console.log(`${serverPath} exists`);
  }
});