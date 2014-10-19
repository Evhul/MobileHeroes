// Game is a global object. It is unique and can be called from wherever in the code.

var Game = {
		interval: 10,     // time between each tick (in ms)
		decimals: 2,      // Number of decimals displayed, 0 for just integers
		
		currency: 0,      // currency owned
                damage: 0,        // damage owned
                progress: 100, //current hp of current mob
                hp: 100, //hp of this mob
                gold: 0, //gold to be earned on current mob
		
		// DOM elements
		button: undefined,
		count: undefined,
		store: undefined,
		dpsDisplay: undefined,
		
		// This is the handle for the setInterval.
		// It is good practice to keep it stored somewhere, if only to be able
		// to stop it with window.clearInterval(Game.handle)
		handle: undefined,
		
		// The possible buildings will be stored in this array
		buildings: [],
		
		init: function(_buildings,_badguys) {
			var self = this;
			
			// -- Cache DOM elements
			// (traversing the DOM with jQuery is costly on large pages, so it is recommended
			// to call static elements just once and store them for future use. Also makes for some
			// more readable code)
			this.button = $('#produce-widget');
			this.count = $('#widget-count');
			this.store = $('#store-container');
			this.dpsDisplay = $('#dps');
			
			// bind the click event
			this.button.click(function() {
				self._click(); // Note about 'self' : inside a jQuery click() function, 'this' will contain the element that has been clicked, in this
							   // case the "Produce widget" button. We use 'self' to still have access to our Game object inside the function.
			});
			
			// -- Initialize all buildings and store them in the buildings array
			$.each(_buildings, function(i, _building) {
				var newBuilding = Building(_building).init();
				self.buildings.push(newBuilding);
			});
                        
                        this.progress = _badguys[0].hp;
                        this.hp = _badguys[0].hp;
                        this.gold = _badguys[0].gold;
                        //this.currency.toFixed(this.decimals)
                        $('#pbar').css('width', ((this.progress/this.hp)*100).toFixed(this.decimals) + '%').attr('aria-valuenow', Game.hp);
                        $('#pbar').text(_badguys[0].name);
			
			// Launch the ticker
			this.handle = window.setInterval(function() {
				self._tick();
			}, this.interval);
		},
		
		// called each time you click
		_click: function() {
                    //1 damage
			this.progress--;
                        updateProgress();
		},
		
		// called at each tick
		_tick: function() {
			// Each building produces his damage, and then we check
			// if we have enough to buy another (ie reactivate the button)
			$.each(this.buildings, function(i, building) {
                                Game.damage = 0;
				building.produce();
				building.check();
			});
			
                        //we should update every tick to display current progress
                        updateProgress();
			// Update the currency we have. toFixed() is used to round to n decimals
			this.count.text(this.currency.toFixed(this.decimals));
		},
		
		// calculates and displays the current DPS
		dps: function() {
			var dps = 0;
			
			// calculates
			$.each(this.buildings, function(i, building) {
				dps += building.production * building.quantity;
			});
			
			// displays
			this.dpsDisplay.text(dps);
		}
};


var Building = function(options) {
	return $.extend({
		quantity: 0,   // you start with 0 of each building
		increase: 1.1, // this is the ratio of price increase
		button: undefined, // this will contain the DOM element of the button to buy this building
		
		// at each tick, every building produces his dps
		produce: function() {
			Game.damage += this.quantity * this.production / 100;
                        updateProgress(); // every tick decrease values
		},
		
		// activates the button if we have enough currency to buy this building
		check: function() {
			if (this.cost > Game.currency) {
				this.button.attr("disabled", "disabled");
			} else {
				this.button.removeAttr("disabled");
			}
		},
		
		// buys this building
		buy: function() {
			Game.currency -= this.cost;
			
			this.quantity++;
			this.cost = Math.ceil(this.cost * 1.1);
			this.button.text("Buy " + this.name + " - " + this.cost);
			// update the displayed dps when we buy a building
			Game.dps();
		},
		
		// initialize a building
		init: function() {
			var self = this;
			
			// create the button
			this.button = $("<div class='btn btn-primary'> ")
							.text("Buy " + this.name + " - " + this.cost)
							.click(function() {
								self.buy();
							});
			
			// display the button
			Game.store.append(this.button);
			
			// check if the button should be activated
			this.check();
			
			// we return this, so the whole Building object we just initialized can be stored
			// in the Game.buildings array
			return this;
		}
	}, options);
};

// Here we define the different buildings.
// note that adding a building is as simple as adding an object inside this array
_buildings = [
	{
		name: "Cotton Ball",
		cost: 2,
		production: 1
	},
	{
		name: "Needle",
		cost: 30,
		production: 5
	},
	{
		name: "Nail",
		cost: 500,
		production: 20
	},
	{
		name: "Club",
		cost: 5400,
		production: 50
	},
	{
		name: "Sword",
		cost: 12000,
		production: 100
	}
];

//Badguys
_badguys = [
	{
		name: "Billy",
		hp: 10,
		gold: 1
	},
	{
		name: "Bobby",
		hp: 30,
		gold: 5
	},
	{
		name: "Frankie",
		hp: 500,
		gold: 20
	},
	{
		name: "Skippy",
		hp: 5400,
		gold: 75
	},
	{
		name: "Roboto",
		hp: 12000,
		gold: 150
	}
];

var updateProgress = function () {
    Game.progress-= Game.damage;
    if (Game.progress <= 0) {
        //Give gold = badguy worth..
        Game.currency += Game.gold;
        Game.progress = Game.hp; //HP
        //GIVE GOLD
    }
    //$('#pbar').css('width', Game.progress + '%').attr('aria-valuenow', Game.progress);
    $('#pbar').css('width', ((Game.progress/Game.hp)*100) + '%').attr('aria-valuenow', Game.progress);
    $('#pbar').text(Game.progress.toFixed(this.decimals) + '%');
    
}

// Initialize the Game
Game.init(_buildings,_badguys);

