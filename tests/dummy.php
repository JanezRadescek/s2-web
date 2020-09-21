<?php
$servername = "localhost";
$username = "s2_webpage";
$password = "Nattuzai1";

// Create connection
$conn = new mysqli($servername, $username, $password);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}
echo "Connected successfully";
?> 