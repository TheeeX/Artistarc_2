<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN"
"http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="nl" lang="nl">
<head>
	<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
	<meta name="description" content="A short description." />
	<meta name="keywords" content="put, keywords, here" />
	<title>Artistarc</title>
	<link rel="stylesheet" href="style.css" type="text/css">
</head>
<style>
body {
	background-color: #4E4E4E;
	text-align: center;			/* make sure IE centers the page too */
}

#wrapper {
	width: 900px;
	margin: 0 auto; 			/* center the page */
}

#content {
	background-color: #fff;
	border: 1px solid #000;
	float: left;
	font-family: Arial;
	padding: 20px 30px;
	text-align: left;
	width: 100%;				/* fill up the entire div */
}

#menu {
	float: left;
	border: 1px solid #000;
	border-bottom: none;		/* avoid a double border */
	clear: both;				/* clear:both makes sure the content div doesn't float next to this one but stays under it */
	width:100%;
	height:20px;
	padding: 0 30px;
	background-color: #FFF;
	text-align: left;
	font-size: 85%;
}

#menu a:hover {
	background-color: #009FC1;
}

#userbar {
	background-color: #fff;
	float: right;
	width: 250px;
}

#footer {
	clear: both;
}

/* begin table styles */
table {
	border-collapse: collapse;
	width: 100%;
}

table a {
	color: #000;
}

table a:hover {
	color:#373737;
	text-decoration: none;
}

th {
	background-color: #B40E1F;
	color: #F0F0F0;
}

td {
	padding: 5px;
}

/* Begin font styles */
h1, #footer {
	font-family: Arial;
	color: #F1F3F1;
}

h3 {margin: 0; padding: 0;}

/* Menu styles */
.item {
	background-color: #00728B;
	border: 1px solid #032472;
	color: #FFF;
	font-family: Arial;
	padding: 3px;
	text-decoration: none;
}

.leftpart {
	width: 70%;
}

.rightpart {
	width: 30%;
}

.small {
	font-size: 75%;
	color: #373737;
}
#footer {
	font-size: 65%;
	padding: 3px 0 0 0;
}

.topic-post {
	height: 100px;
	overflow: auto;
}

.post-content {
	padding: 30px;
}

textarea {
	width: 500px;
	height: 200px;
}
</style>
<body>
<h1>Artistarc</h1>
	<div id="wrapper">
	<div id="menu">
		<a class="item" href="/forum/index.php">Home</a> -
		<a class="item" href="/forum/create_topic.php">Message</a> -
		<a class="item" href="/forum/create_cat.php">Create group</a>
		
		<div id="userbar">
		<?php
 session_start();
 if(isset($_SESSION['signed_in'])){
   echo 'Welcome, ' . $_SESSION['user_name'] . '. <a href="index.php">Proceed to the forum overview</a>.';
	 echo 'not you?' . ' ' . '<a href="signout.php">sign out</a> ';
	 
	 	}
 	else
 	{
 		echo '<a href="signin.php">Sign in</a> or <a href="signup.php">create an account</a>.';
 	}
?>
</div>
</div>
		<div id="content">
	


