// Primary variables and requirements
const prompt = require("prompt");
const inquirer = require("inquirer");
const mysql = require("mysql");
const formatCurrency = require('format-currency');
require("console.table");
var truthy = true;
var connection = mysql.createConnection({
	host     : 'localhost',
	user     : 'root',
	database : 'Bamazon'
});

//Run the connection
connection.connect();

//Query the SQL database, print the table, and begin the inquiry
const fetchProducts = () => {
	connection.query('SELECT * FROM products', (err, res) => {
		if (err) throw err;
		console.log("");
		console.table(res);
		initializeBamazon();
	});	
};

//Only make the banner appear the first time the user runs the program
const displayBamazonBanner = () => {
	if (truthy) {
		console.log("----------------------WELCOME TO BAMAZON!----------------------\n");
		truthy = false;
	};
};

// Initial inquiry
const initializeBamazon = () => {
	displayBamazonBanner();
	let properties = {
		properties: {
			// The first should ask them the ID of the product they would like to buy.
			id: {
				name: 'id',
				message: 'Type in the id # of the item you want to buy',
				validator: /^[0-9]*$/,
				warning: 'Please enter a number!'
			},
			// The second message should ask how many units of the product they would like to buy.
			amount: {
				name: 'amount',
				message: 'How many would you like to buy?',
				validator: /^[0-9]*$/,
				warning: 'Please enter a number (no decimals either)!'
			}
		}
	}
	//Begin the prompt, and check if the user inputs information appropriately.
	prompt.start();
	prompt.get(properties, (err, res) => {
		if (err) console.log(err);
		checkInputs(res);
	});
};

const checkInputs = (res) => {
	//User cannot leave fields blank or enter a product ID that does not exist
	if (res.id === '' || res.amount === '') {
		console.log("\nOops! Looks like you left a field (or two) blank. Try again!\n");
		initializeBamazon();
	} else if (Number(res.id) > 10 || Number(res.id) < 1) {
		console.log("\nThe ID that you entered doesn't exist! Try again you silly goose.\n");
		initializeBamazon();
	} else {
		checkBamazonInventory(res.id, res.amount);
	};
};

const checkBamazonInventory = (item_id, stock_quantity) => {
	let userId = Number(item_id);
	let userQuantity = Number(stock_quantity);
	connection.query("SELECT item_id, stock_quantity, price FROM products WHERE item_id=?", [userId], (err, res) => {
		let databaseStock = res[0].stock_quantity;
		let databasePrice = res[0].price;
		if (err) console.log(err);
		//Check to ensure that the quantity in the database is sufficient
		if (databaseStock < userQuantity) {
			console.log("\nInsufficient quantity available (sorry)! Try again!\n");
			initializeBamazon();
		} else {
			//Otherwise, update the database to match user input and print the total cost
			updateDatabaseQuantities(databaseStock, databasePrice, userQuantity, userId);
		};
	});
};

const updateDatabaseQuantities = (databaseStock, databasePrice, userQuantity, userId) => {
	connection.query("UPDATE products SET stock_quantity=? WHERE item_id=?", [(databaseStock - userQuantity), userId], (err, res) => {
		console.log("\nYour order went through!\n");
		// Ensure that the cost statement follows the order confirmation statement by
		// including it in the updateDatabaseQuantities function
		calculateTotalCost(databasePrice, userQuantity);
		//Ask the user if he/she wishes to continue shopping
		runSecondInquiry();
	});
};

const calculateTotalCost = (databasePrice, userQuantity) => {
	//Format currency appropriately using node package and return the value to the user
	console.log("That hypothetical transaction cost you: " + "$" + formatCurrency(Number(databasePrice) * Number(userQuantity)) + "\n");
};

const runSecondInquiry = () => {
	inquirer.prompt([{
		type: 'list',
		name: 'shopping',
		message: "Do you want to keep shopping?",
		choices: ["YES PLEASE!", "No thanks :("],
		default: 1
	}]).then((answers) => {
		//Either restart the process or end the connection!
		if (answers.shopping === "YES PLEASE!") {
			fetchProducts();
		} else if (answers.shopping === "No thanks :(") {
			connection.end();
		};
	});
};

//Function called to print the table and begin the inquiry
fetchProducts();
// connection.end();
