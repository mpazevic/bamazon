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

//Initial manager question
const managerQuestion = () => {
	console.log("");
	inquirer.prompt([{
		type: 'list',
		name: 'managerQuestion',
		message: "What would you like to do, Mr. Manager?",
		choices: ["View products for sale", "View low inventory", "Add to inventory", "Add new product", "Exit"],
		default: 0
	}]).then((answers) => {
		//Various questions to perform different managerial tasks
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
			console.log("");
			addNewProduct();
		} else if (answers.managerQuestion === "Exit") {
			console.log("\nSee ya!\n");
			connection.end();
		};
	});
};

//Show table of products available in the store
const viewProducts = () => {
	connection.query('SELECT * FROM products', (err, res) => {
		if (err) throw err;
		console.table(res);
		continuePrompt();
	});	
};

//Useing an sql query, check where quantity is less than 5 in the database
const viewLow = () => {
	connection.query("SELECT * FROM products WHERE stock_quantity < 5", (err, res) => {
		if (err) throw err;
		//If no products have a quantity less than 5, tell the manager that the inventory is full
		if (res.length === 0) {
			console.log("Looks like your inventory is pretty full!\n");
			continuePrompt();
		} else {
			//Otherwise, show a table with the returned results
			console.table(res);
			continuePrompt();
		};
	});
};

//Show inventory and call addInventory to actually add an item
const viewInventoryandSelect = () => {
	connection.query("SELECT * FROM products", (err, res) => {
		if (err) throw err;
		console.table(res);
		addInventory();
	});
};

const addInventory = () => {
	let properties = {
		properties: {
			// The first should ask them the ID of the product the manager wants to add to.
			id: {
				name: 'id',
				message: 'Type in the id # of the item you want to add inventory to',
				validator: /^[0-9]*$/,
				warning: 'Please enter a number!'
			},
			// The second message should ask the manager the specific quantity to be added.
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
	if (res.id === '' && res.amount === '') {
		console.log("");
		giveOptionToExit();
	} else if (res.id === '' || res.amount === '') {
		console.log("\nOops! Looks like you left a field blank. Try again!\n");
		addInventory();
	} else {
		//If all fields are filled out, check that the manager-requested item exists
		queryCheck(res.id, res.amount);
	}
};

const queryCheck = (selectedId, queryAmount) => {
	//Check that the selected item exists by querying the database
	connection.query("SELECT item_id, stock_quantity FROM products WHERE item_id=?", [selectedId], (err, res) => {
		if (res.length === 0) {
			console.log("\nThe ID of the item you're looking for doesn't exist! Try again.\n");
			addInventory();
		} else {
			//If it exists, update the inventory with the selected id and user amount
			updateBamazonInventory(selectedId, queryAmount);
		};
	});
};

const updateBamazonInventory = (item_id, stock_quantity) => {
	let managerId = Number(item_id);
	let managerQuantity = Number(stock_quantity);
	//Get the item_id and stock quantities from the database, and run the results in a function
	//that actually alters the database quantities
	connection.query("SELECT item_id, stock_quantity FROM products WHERE item_id=?", [managerId], (err, res) => {
		let databaseStock = res[0].stock_quantity;
		if (err) console.log(err);
		updateDatabaseQuantities(databaseStock, managerQuantity, managerId);
	});
};

const updateDatabaseQuantities = (databaseStock, managerQuantity, managerId) => {
	//Query the database to update the item selected with the quantity selected
	//added to the quantity that already exists in the database
	connection.query("UPDATE products SET stock_quantity=? WHERE item_id=?", [(databaseStock + managerQuantity), managerId], (err, res) => {
		console.log("\nYour inventory has been updated, commander!\n");
		viewProducts();
	});
};

const addNewProduct = () => {
	let properties = {
		properties: {
			// The first message should ask about the name of the product
			proName: {
				name: 'productName',
				message: 'What is the name of the product you\'d like to add?'
			},
			// The second message should ask about the department it's in
			depName: {
				name: 'productDepName',
				message: 'What department is this product in?',
				validator: /^[a-zA-Z\s\-]+$/,
				warning: 'Name must be only letters, spaces, or dashes'
			},
			// The third message should inquire about the price of the product
			price: {
				name: 'productPrice',
				message: 'How much does this item cost in dollars (ex: 50, .65, etc.)?',
				validator: /^[0-9\.]*$/,
				warning: 'Invalid input!'
			},
			// The fourth message should ask about the stock desired for the product
			stock: {
				name: 'productStock',
				message: 'How much of this product is in stock?',
				validator: /^[0-9]*$/,
				warning: "Don\'t include decimals, letters, or symbols!"
			},
		}
	};
	prompt.start();
	prompt.get(properties, (err, res) => {
		if (err) console.log(err);
		//Once the input is entered for the new product, check that it is appropriate
		checkProductInput(res);
	});
};

const checkProductInput = (res) => {
	//If everything is blank, give the person the option to exit the process
	if (res.proName === '' && res.depName === '' && res.price === '' && res.stock === '') {
		giveOptionToExit();
	} else if (res.proName === '' || res.depName === '' || res.price === '' || res.stock === '') {
		console.log("\nOops! I think you left a field blank.\n");
		addNewProduct();
	} else {
		// If everything else checks out, add the product to the database
		addNewProToDatabase(res.proName, res.depName, res.price, res.stock);
	}
};

const addNewProToDatabase = (proName, depName, price, stock) => {
	// Require user information about the product
	var post  = {
		product_name: proName, 
		department_name: depName,
		price: price,
		stock_quantity: stock
	};
	// Query the database and insert the user-selected items
	connection.query('INSERT INTO products SET ?', post, (err, res) => {
	  if (err) throw err;
	  //The the user know he/she has done well, and show him/her the updated table
	  console.log("\nNice! You inserted a product into the inventory!\n");
	  viewProducts();
	});
};

const giveOptionToExit = () => {
	inquirer.prompt([{
		name: "check",
		type: "list",
		message: "Hmmm..do you want to return to the selection menu or exit the program?",
		choices: ["Return to the selection menu", "Exit the program"],
		default: 0
	}]).then((answers) => {
		//Either return to the selection menu or end the connection!
		if (answers.check === "Return to the selection menu") {
			managerQuestion();
		} else if (answers.check === "Exit the program") {
			connection.end();
		};
	});
};

//Nearly the same as giveOptionToExit, just with different wording!
const continuePrompt = () => {
	inquirer.prompt([{
		type: 'list',
		name: 'managerQuestion',
		message: "Would you like to continue with managerial operations?",
		choices: ["Yes--I AM a manager, after all", "No thanks"],
		default: 0
	}]).then((answers) => {
		if (answers.managerQuestion === "Yes--I AM a manager, after all") {
			console.log("");
			managerQuestion();
		} else if (answers.managerQuestion === "No thanks") {
			console.log("\nSee you later then!");
			console.log("");
			connection.end();
		};
	});
};

//Begin the process
managerQuestion();