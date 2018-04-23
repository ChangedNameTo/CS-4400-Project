DROP TABLE IF EXISTS Has;
DROP TABLE IF EXISTS FarmItem;
DROP TABLE IF EXISTS Visit;
DROP TABLE IF EXISTS Property;
DROP TABLE IF EXISTS User;

CREATE TABLE User(
	Username varchar(50),
	Email varchar(50) NOT NULL,
	Password char(32) NOT NULL,
	UserType enum('ADMIN', 'OWNER', 'VISITOR') NOT NULL,
	PRIMARY KEY(Username),
	UNIQUE(Email)
);

CREATE TABLE Property(
	ID int NOT NULL CHECK (ID < 100000),
	Name varchar(255) NOT NULL,
	Size float NOT NULL,
	IsCommercial boolean NOT NULL,
	IsPublic boolean NOT NULL,
	Street varchar(255) NOT NULL,
	City varchar(100) NOT NULL,
	Zip int NOT NULL,
	PropertyType enum('FARM', 'GARDEN', 'ORCHARD') NOT NULL,
	Owner varchar(50) NOT NULL,
	ApprovedBy varchar(50),
	PRIMARY KEY(ID),
	UNIQUE(Name),
	FOREIGN KEY (Owner) REFERENCES User(Username) ON DELETE CASCADE ON UPDATE CASCADE,
	FOREIGN KEY(ApprovedBy) REFERENCES User(Username) ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE Visit(
	Username varchar(50),
	PropertyID int,
	VisitDate timestamp NOT NULL,
	Rating int NOT NULL CHECK (Rating >= 1 AND Raing <= 5),
	CONSTRAINT Pk_Visit PRIMARY KEY (Username, PropertyID),
	FOREIGN KEY (Username) REFERENCES User(Username) ON DELETE CASCADE ON UPDATE CASCADE,
	FOREIGN KEY (PropertyID) REFERENCES Property(ID) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE FarmItem(
	Name varchar(100),
	IsApproved boolean NOT NULL,
	Type enum('ANIMAL', 'FRUIT', 'FLOWER', 'VEGETABLE', 'NUT') NOT NULL,
	PRIMARY KEY(Name)
);

CREATE TABLE Has(
	PropertyID int,
	ItemName varchar(100),
	CONSTRAINT Pk_Has PRIMARY KEY(PropertyID, ItemName),
	FOREIGN KEY (PropertyID) REFERENCES Property(ID) ON DELETE CASCADE ON UPDATE CASCADE,
	FOREIGN KEY (ItemName) REFERENCES FarmItem(Name) ON DELETE CASCADE ON UPDATE CASCADE
);

INSERT INTO User(Username,Email,Password,UserType) VALUES ('admin1','zuckerburg@fb.com','4bc7210680fbbd3645551fe7e471ba4c','ADMIN');
INSERT INTO User(Username,Email,Password,UserType) VALUES ('admin2','michael@gmail.com','87d5dae5587e5d79187e8221c20d6385','ADMIN');
INSERT INTO User(Username,Email,Password,UserType) VALUES ('ceo','ceo@gatech.edu','439c7fd92969510d873330e327c0f64d','ADMIN');
INSERT INTO User(Username,Email,Password,UserType) VALUES ('farmowner','farmerJoe@gmail.com','d68fae04506bde7857ff4aa40ebad49c','OWNER');
INSERT INTO User(Username,Email,Password,UserType) VALUES ('gardenowner','gardenerSteve@hotmail.com','e975d28e35f84ee1282d6aa5c1f2a7df','OWNER');
INSERT INTO User(Username,Email,Password,UserType) VALUES ('orchardowner','orchardOwen@myspace.com','9bd76ce7ce133994c4c4cc2488049d61','OWNER');
INSERT INTO User(Username,Email,Password,UserType) VALUES ('billybob','bobbilly@harvard.edu','bb67a3d067d05a1b55e2c36c7ce188a7','VISITOR');
INSERT INTO User(Username,Email,Password,UserType) VALUES ('iloveflowers','flowerpower@gmail.com','ca31a1476f7b7c5514f0aedd2462358b','VISITOR');
INSERT INTO User(Username,Email,Password,UserType) VALUES ('greenguy','bill@yahoo.com','fb8da64f829e8fc7b40a665758c069e6','VISITOR');
INSERT INTO User(Username,Email,Password,UserType) VALUES ('lonelyowner','fake@gmail.com','877c9bca7906827d26fe3e60bd288b09','OWNER');
INSERT INTO User(Username,Email,Password,UserType) VALUES ('riyoy1996','yamada.riyo@navy.mil.gov','7039e7594e4f4fd6789e9810150e64b9','VISITOR');
INSERT INTO User(Username,Email,Password,UserType) VALUES ('kellis','kateellis@gatech.edu','370133f7117dc65e277d6dbb858450c1','VISITOR');
INSERT INTO User(Username,Email,Password,UserType) VALUES ('ashton.woods','awoods30@gatech.edu','27465020c9ea11fc41fac2af1daeba5f','VISITOR');
INSERT INTO User(Username,Email,Password,UserType) VALUES ('adinozzo','anthony.dinozzo@ncis.mil.gov','c67e443eaa780debf5ee2d71a2a7dc39','VISITOR');

INSERT INTO Property(ID,Name,Size,IsCommercial,IsPublic,Street,City,Zip,PropertyType,Owner,ApprovedBy) VALUES (00000,'Atwood Street Garden',1,0,1,'Atwood Street SW','Atlanta',30308,'GARDEN','gardenowner','admin1');
INSERT INTO Property(ID,Name,Size,IsCommercial,IsPublic,Street,City,Zip,PropertyType,Owner,ApprovedBy) VALUES (00001,'East Lake Urban Farm',20,1,0,'2nd Avenue','Atlanta',30317,'FARM','farmowner',NULL);
INSERT INTO Property(ID,Name,Size,IsCommercial,IsPublic,Street,City,Zip,PropertyType,Owner,ApprovedBy) VALUES (00002,'Georgia Tech Garden',0.5,0,1,'Spring Street SW','Atlanta',30308,'GARDEN','orchardowner','admin2');
INSERT INTO Property(ID,Name,Size,IsCommercial,IsPublic,Street,City,Zip,PropertyType,Owner,ApprovedBy) VALUES (00003,'Georgia Tech Orchard',0.5,0,1,'Spring Street SW','Atlanta',30308,'ORCHARD','orchardowner','admin2');
INSERT INTO Property(ID,Name,Size,IsCommercial,IsPublic,Street,City,Zip,PropertyType,Owner,ApprovedBy) VALUES (00004,'Woodstock Community Garden',5,0,1,'1804 Bouldercrest Road','Woodstock',30188,'GARDEN','gardenowner',NULL);
INSERT INTO Property(ID,Name,Size,IsCommercial,IsPublic,Street,City,Zip,PropertyType,Owner,ApprovedBy) VALUES (00005,'Kenari Company Farm',3,1,1,'100 Hightower Road','Roswell',30076,'FARM','farmowner','ceo');

INSERT INTO Visit(Username,PropertyID,VisitDate,Rating) VALUES ('billybob',00000,'2018-11-12 00:00:01',5);
INSERT INTO Visit(Username,PropertyID,VisitDate,Rating) VALUES ('billybob',00003,'2018-10-23 15:21:49',3);
INSERT INTO Visit(Username,PropertyID,VisitDate,Rating) VALUES ('billybob',00002,'2018-10-24 18:31:12',1);
INSERT INTO Visit(Username,PropertyID,VisitDate,Rating) VALUES ('greenguy',00002,'2018-1-23 16:12:34',4);
INSERT INTO Visit(Username,PropertyID,VisitDate,Rating) VALUES ('iloveflowers',00000,'2018-2-14 23:21:12',5);
INSERT INTO Visit(Username,PropertyID,VisitDate,Rating) VALUES ('greenguy',00000,'2018-3-3 23:12:10',2);
INSERT INTO Visit(Username,PropertyID,VisitDate,Rating) VALUES ('greenguy',00005,'2017-1-2 19:21:10',2);
INSERT INTO Visit(Username,PropertyID,VisitDate,Rating) VALUES ('riyoy1996',00005,'2017-10-28 21:11:13',4);
INSERT INTO Visit(Username,PropertyID,VisitDate,Rating) VALUES ('kellis',00005,'2017-10-27 08:40:11',2);
INSERT INTO Visit(Username,PropertyID,VisitDate,Rating) VALUES ('ashton.woods',00002,'2017-10-27 03:31:30',5);
INSERT INTO Visit(Username,PropertyID,VisitDate,Rating) VALUES ('adinozzo',00003,'2017-10-10 00:00:00',1);

INSERT INTO FarmItem(Name,IsApproved,Type) VALUES ('Apple',1,'FRUIT');
INSERT INTO FarmItem(Name,IsApproved,Type) VALUES ('Banana',1,'FRUIT');
INSERT INTO FarmItem(Name,IsApproved,Type) VALUES ('Orange',1,'FRUIT');
INSERT INTO FarmItem(Name,IsApproved,Type) VALUES ('Peach',1,'FRUIT');
INSERT INTO FarmItem(Name,IsApproved,Type) VALUES ('Peruvian Lily',1,'FLOWER');
INSERT INTO FarmItem(Name,IsApproved,Type) VALUES ('Sunflower',1,'FLOWER');
INSERT INTO FarmItem(Name,IsApproved,Type) VALUES ('Pineapple Sage',0,'FLOWER');
INSERT INTO FarmItem(Name,IsApproved,Type) VALUES ('Daffodil',0,'FLOWER');
INSERT INTO FarmItem(Name,IsApproved,Type) VALUES ('Onion',1,'VEGETABLE');
INSERT INTO FarmItem(Name,IsApproved,Type) VALUES ('Garlic',1,'VEGETABLE');
INSERT INTO FarmItem(Name,IsApproved,Type) VALUES ('Broccoli',1,'VEGETABLE');
INSERT INTO FarmItem(Name,IsApproved,Type) VALUES ('Carrot',0,'VEGETABLE');
INSERT INTO FarmItem(Name,IsApproved,Type) VALUES ('Corn',1,'VEGETABLE');
INSERT INTO FarmItem(Name,IsApproved,Type) VALUES ('Salami',0,'VEGETABLE');
INSERT INTO FarmItem(Name,IsApproved,Type) VALUES ('Peas',1,'VEGETABLE');
INSERT INTO FarmItem(Name,IsApproved,Type) VALUES ('Rose',1,'FLOWER');
INSERT INTO FarmItem(Name,IsApproved,Type) VALUES ('Daisy',1,'FLOWER');
INSERT INTO FarmItem(Name,IsApproved,Type) VALUES ('Peanut',1,'NUT');
INSERT INTO FarmItem(Name,IsApproved,Type) VALUES ('Cashew',1,'NUT');
INSERT INTO FarmItem(Name,IsApproved,Type) VALUES ('Almond',0,'NUT');
INSERT INTO FarmItem(Name,IsApproved,Type) VALUES ('Fig',0,'NUT');
INSERT INTO FarmItem(Name,IsApproved,Type) VALUES ('Pig',1,'ANIMAL');
INSERT INTO FarmItem(Name,IsApproved,Type) VALUES ('Chicken',1,'ANIMAL');
INSERT INTO FarmItem(Name,IsApproved,Type) VALUES ('Cow',1,'ANIMAL');
INSERT INTO FarmItem(Name,IsApproved,Type) VALUES ('Mongoose',0,'ANIMAL');
INSERT INTO FarmItem(Name,IsApproved,Type) VALUES ('Monkey',1,'ANIMAL');
INSERT INTO FarmItem(Name,IsApproved,Type) VALUES ('Cheetah',0,'ANIMAL');
INSERT INTO FarmItem(Name,IsApproved,Type) VALUES ('Pete',0,'ANIMAL');
INSERT INTO FarmItem(Name,IsApproved,Type) VALUES ('Pineapple',0,'FRUIT');
INSERT INTO FarmItem(Name,IsApproved,Type) VALUES ('Kiwi',1,'FRUIT');
INSERT INTO FarmItem(Name,IsApproved,Type) VALUES ('Tomato',0,'FRUIT');
INSERT INTO FarmItem(Name,IsApproved,Type) VALUES ('Goat',1,'ANIMAL');

INSERT INTO Has(PropertyID,ItemName) VALUES (00000,'Broccoli');
INSERT INTO Has(PropertyID,ItemName) VALUES (00001,'Corn');
INSERT INTO Has(PropertyID,ItemName) VALUES (00002,'Rose');
INSERT INTO Has(PropertyID,ItemName) VALUES (00003,'Apple');
INSERT INTO Has(PropertyID,ItemName) VALUES (00004,'Carrot');
INSERT INTO Has(PropertyID,ItemName) VALUES (00005,'Chicken');
INSERT INTO Has(PropertyID,ItemName) VALUES (00001,'Pig');
INSERT INTO Has(PropertyID,ItemName) VALUES (00005,'Corn');
INSERT INTO Has(PropertyID,ItemName) VALUES (00003,'Peanut');
INSERT INTO Has(PropertyID,ItemName) VALUES (00002,'Peas');
INSERT INTO Has(PropertyID,ItemName) VALUES (00002,'Peruvian Lily');
INSERT INTO Has(PropertyID,ItemName) VALUES (00000,'Corn');
INSERT INTO Has(PropertyID,ItemName) VALUES (00001,'Cow');
INSERT INTO Has(PropertyID,ItemName) VALUES (00001,'Chicken');
INSERT INTO Has(PropertyID,ItemName) VALUES (00000,'Onion');
INSERT INTO Has(PropertyID,ItemName) VALUES (00000,'Daisy');
INSERT INTO Has(PropertyID,ItemName) VALUES (00003,'Peach');
INSERT INTO Has(PropertyID,ItemName) VALUES (00005,'Orange');
INSERT INTO Has(PropertyID,ItemName) VALUES (00005,'Cashew');
INSERT INTO Has(PropertyID,ItemName) VALUES (00005,'Cow');
INSERT INTO Has(PropertyID,ItemName) VALUES (00005,'Sunflower');
