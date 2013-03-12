<?

include 'db.php';

handleRawRequest($_SERVER, $_GET, $_POST);

function handleRawRequest($_SERVER, $_GET, $_POST) {
	$url = getFullUrl($_SERVER);
	$method = $_SERVER['REQUEST_METHOD'];
	switch ($method) {
		case 'GET':
		case 'HEAD':
			$arguments = $_GET;
			break;
		case 'POST':
			$arguments = file_get_contents('php://input');
			break;
		case 'PUT':
			$arguments = file_get_contents('php://input');
			break;
		case 'DELETE':
			break;
	}
	$accept = $_SERVER['HTTP_ACCEPT'];
	handleRequest($url, $method, $arguments, $accept);
}

function getFullUrl($_SERVER) {
	$protocol = 'http';
	$location = $_SERVER['REQUEST_URI'];
	if ($_SERVER['QUERY_STRING']) {
		$location = substr($location, 0, strrpos($location, $_SERVER['QUERY_STRING']) - 1);
	}
	return $protocol . '://' . $_SERVER['HTTP_HOST'] . $location;
}

function getId() {
	$pos = strpos($_SERVER['REQUEST_URI'], 'handler.php');
	$id = substr($_SERVER['REQUEST_URI'], $pos + strlen('handler.php/'));
	return $id;
}

function handleRequest($url, $method, $arguments, $accept) {
/*	if ($method == 'GET') {
		if (isset($arguments['search']))
			searchBooks($arguments['search']);
		else if (isset($arguments['delete']))
			deleteBook($arguments['delete']);
		else
			getBooks();
	}
	else if ($method == 'POST') {
		$type = json_decode($arguments)->type;
		
		if ($type == 'add') {
			addBook($arguments);
		}
		else {
			updateBook($arguments);
		}
	}*/
	
	if ($method == 'GET') {
		if (isset($arguments['search']))
			searchBooks($arguments['search']);
		else
			getBooks();
	}
	else if ($method == 'POST') {
		addBook($arguments);
	}
	else if ($method == 'DELETE') {
		deleteBook(getId());
	}
	else if ($method == 'PUT') {
		updateBook($arguments);
	}
}

?>