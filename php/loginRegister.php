<?php
/**
 * Created by PhpStorm.
 * User: janez
 * Date: 5. 11. 2018
 * Time: 15:55
 */

$returnJSON = array();
$returnJSON["error"] = "";


$servername = "localhost";
$username = "read";
$password = "daer";
$dbname = "myDB";

$username = "s2_webpage";
$password = "Nattuzai1";
$dbname = $username;



$conn = new mysqli($servername, $username, $password, $dbname);

//check if we have acces to database
if($conn->connect_errno != 0)
{
    //something went wrong;
    $returnJSON["error"] .= "Something is wrong with database".PHP_EOL;
    $conn->close();
    $json = json_encode($returnJSON);
    die($json);
}

if ($_SERVER["REQUEST_METHOD"] == "POST") {

    //check if correct user and password
    $sql = "SELECT * FROM accounts WHERE accountname = ?";

    $stmt = $conn->prepare($sql);
    $stmt->bind_param("s", $accountname);

    $accountname = $_POST["accountname"];
    $result1 = $stmt->execute();
    $result2 = $stmt->get_result();
    $result3 = $result2->fetch_assoc();
    $stmt->close();


    if(password_verify($_POST["password"], $result3["passwordhash"]))
    {
        $sql = "select fileName, fileID from userFiles where userID = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("i", $result3["userID"]);
        $result1 = $stmt->execute();
        $result2 = $stmt->get_result();

        while($row = $result2->fetch_assoc()) {
            $fileNames[] = $row['fileName'];
            $fileIDs[] = $row['fileID'];
        }

        $stmt->close();


        $returnJSON["registered"] = "yes";
        $returnJSON["fileNames"] = $fileNames;
        $returnJSON["fileIDs"] = $fileIDs;
    }
    else
    {
        $returnJSON["error"] .= "Wrong username or password.".PHP_EOL;
    }


}
else
{
    $returnJSON["error"] .= "POST methods only.".PHP_EOL;
}






$conn->close();
$json = json_encode($returnJSON);
echo $json;





//     -----------------------------------    GLOBAL FUNCTIONS     -------------------------------------------



function test_input($data) {
    $data = trim($data);
    $data = stripslashes($data);
    $data = htmlspecialchars($data);
    return $data;
}

?>