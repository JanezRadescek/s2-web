<?php
/**
 * Created by PhpStorm.
 * User: janez
 * Date: 22.3.2019
 * Time: 18:36
 */

$returnJSON = array();
$returnJSON["error"] = "";


$servername = "localhost";
$username = "delete";
$password = "eteled";
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
        $sql = "delete from userFiles where fileName = ? AND userID = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("si", $_POST["fileName"],$result3["userID"]);
        $result1 = $stmt->execute();
        $result2 = $stmt->get_result();

        $stmt->close();

        if ($result1)
        {
            chdir("..");
            $wdir = getcwd();
            $dir = "./usersFiles/".$accountname."/";

            $file_name = $_POST["fileName"];
            $destination = $dir.$file_name;

            if(file_exists($destination))
            {
                $result =  unlink($destination);
                if ($result)
                {
                    $returnJSON["deleted"] = "yes";
                }
                else
                {
                    $returnJSON["error"] .= "We couldnt delete file".PHP_EOL;
                    //TODO this is sirious problem. it should never happen. we should log it.
                }

            }
            else
            {
                $returnJSON["error"] .= "File was in database but it didnt actually exist. Deleted from database.".PHP_EOL;
                $returnJSON["deleted"] = "yes";
            }

        }
    }


}
else
{
    $returnJSON["error"] .= "POST methods only.".PHP_EOL;
}






$conn->close();
$json = json_encode($returnJSON);
echo $json;

?>