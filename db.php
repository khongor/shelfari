<?php

function addBook($data) {
    try {
        $db = getConnection() or die("Could not connect");
		$book = json_decode($data);
		
		pg_query_params($db, "INSERT INTO BOOK(name, author, status) VALUES($1, $2, $3)", array($book->name, $book->author, $book->status));
		pg_close($db);

		echo json_encode($book);
    } catch(PDOException $e) {
        echo '{"error":{"text":'. $e->getMessage() .'}}';
    }
}

function deleteBook($id) {
    try {
        $db = getConnection() or die("Could not connect");
		
		pg_query_params($db, "DELETE FROM BOOK WHERE id = $1", array($id));
		pg_close($db);

		echo '{}';
    } catch(PDOException $e) {
        echo '{"error":{"text":'. $e->getMessage() .'}}';
    }
}

function updateBook($data) {
    try {
        $db = getConnection() or die("Could not connect");
		$book = json_decode($data);		
		
		pg_query_params($db, "UPDATE BOOK SET name=$1, author=$2, status=$3 WHERE id = $4", array($book->name, $book->author, $book->status, $book->id));
		pg_close($db);

		echo '{}';
    } catch(PDOException $e) {
        echo '{"error":{"text":'. $e->getMessage() .'}}';
    }
}

function getBooks() {
    try {
        $db = getConnection() or die("Could not connect");
		$books = pg_fetch_all(pg_query($db, "SELECT * FROM BOOK ORDER BY id"));
		pg_close($db);
		
		if ($books == false) $books = array();
		
        echo json_encode($books);
    } catch(PDOException $e) {
        echo '{"error":{"text":'. $e->getMessage() .'}}';
    }
}

function searchBooks($name) {
    try {
        $db = getConnection() or die("Could not connect");
		$books = pg_fetch_all(pg_query_params($db, "SELECT * FROM BOOK WHERE name LIKE $1", array('%'.$name.'%')));
		pg_close($db);

		if ($books == false) $books = array();
		
        echo '{"book": ' . json_encode($books) . '}';
    } catch(PDOException $e) {
        echo '{"error":{"text":'. $e->getMessage() .'}}';
    }
}

function getConnection() {
	return pg_connect("host=ec2-23-21-105-133.compute-1.amazonaws.com port=5432 dbname=dcnrb6h8d21qqp user=lbamoozbuarlxb password=gMOdA0fePD6M_9eY_MT1dhgWjg sslmode=require options='--client_encoding=UTF8'");
}

?>
