<?php
$con=mysqli_connect ("localhost","root","ididit","artistarc");
if (mysqli_connect_errno()) {
echo "failed to connect mysql: ". mysqli_connect_error();
}else echo "sucess!";
?>
