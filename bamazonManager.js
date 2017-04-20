//Primary variables and requirements
const inquirer = require("inquirer");
require("console.table");
const mysql = require("mysql");
const prompt = require("prompt");
const connection = mysql.createConnection({
	host     : 'localhost',
	user     : 'root',
	database : 'Bamazon'
});

//Begin connection
connection.connect();

const managerQuestion = () => {
	console.log("");
	inquirer.prompt([{
		type: 'list',
		name: 'managerQuestion',
		message: "What would you like to do, Mr. Manager?",
		choices: ["View products for sale", "View low inventory", "Add to inventory", "Add new product"],
		default: 0
	}]).then((answers) => {
		//Either restart the process or end the connection!
		if (answers.managerQuestion === "View products for sale") {
			viewProducts();
			console.log("");
		} else if (answers.managerQuestion === "View low inventory") {
			viewLow();
			console.log("");
		} else if (answers.managerQuestion === "Add to inventory") {
			console.log("");
			viewInventoryandSelect();
		} else if (answers.managerQuestion === "Add new product") {
			console.log("Add new product function"); 
		};
	});
};

const viewProducts = () => {
	connection.query('SELECT * FROM products', (err, res) => {
		if (err) throw err;
		console.table(res);
		continuePrompt();
	});	
};

const viewLow = () => {
	connection.query("SELECT * FROM products WHERE stock_quantity < 5", (err, res) => {
		if (err) throw err;
		if (res.length === 0) {
			console.log("Looks like your inventory is pretty full!\n");
			continuePrompt();
		} else {
			console.table(res);
			continuePrompt();
		};
	});
};

const addInventory = () => {
	let properties = {
		properties: {
			// The first should ask them the ID of the product they would like to buy.
			id: {
				name: 'id',
				message: 'Type in the id # of the item you want to add inventory to',
				validator: /^[0-9]*$/,
				warning: 'Please enter a number!'
			},
			// The second message should ask how many units of the product they would like to buy.
			amount: {
				name: 'amount',
				message: 'How much would you like to add?',
				validator: /^[0-9]*$/,
				warning: 'Please enter a number (no decimals either)!'
			}
		}
	}
	//Begin the prompt, and check if the user inputs information appropriately.
	prompt.start();
	prompt.get(properties, (err, res) => {
		if (err) console.log(err);
		checkInputsAndUpdate(res);
	});
};

const checkInputsAndUpdate = (res) => {
	//User cannot leave fields blank or enter a product ID that does not exist
	if (res.id === '' || res.amount === '') {
		console.log("\nOops! Looks like you left a field (or two) blank. Try again!\n");
		addInventory();
	} else if (Number(res.id) > 10 || Number(res.id) < 1) {
		console.log("\nThe ID that you entered doesn't exist! Try again you silly goose.\n");
		addInventory();
	} else {
		updateBamazonInventory(res.id, res.amount);
	};
};

const updateBamazonInventory = (item_id, stock_quantity) => {
	let managerId = Number(item_id);
	let managerQuantity = Number(stock_quantity);
	connection.query("SELECT item_id, stock_quantity FROM products WHERE item_id=?", [managerId], (err, res) => {
		let databaseStock = res[0].stock_quantity;
		if (err) console.log(err);
		updateDatabaseQuantities(databaseStock, managerQuantity, managerId);
	});
};

const updateDatabaseQuantities = (databaseStock, managerQuantity, managerId) => {
	connection.query("UPDATE products SET stock_quantity=? WHERE item_id=?", [(databaseStock + managerQuantity), managerId], (err, res) => {
		console.log("\nYour inventory has been updated, commander!\n");
		viewProducts();
	});
};

const viewInventoryandSelect = () => {
	connection.query("SELECT * FROM products", (err, res) => {
		if (err) throw err;
		console.table(res);
		addInventory();
	});
};

const continuePrompt = () => {
	inquirer.prompt([{
		type: 'list',
		name: 'managerQuestion',
		message: "Would you like to continue with managerial operations?",
		choices: ["Yes--I am a manager, after all", "No thanks"],
		default: 0
	}]).then((answers) => {
		if (answers.managerQuestion === "Yes--I am a manager, after all") {
			console.log("");
			managerQuestion();
		} else if (answers.managerQuestion === "No thanks") {
			console.log("\nSee you later then!");
			console.log("");
			connection.end();
		};
	});
};


managerQuestion();