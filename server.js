const express = require('express');
const admin = require('firebase-admin');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Initialize Firebase Admin SDK
let firebaseApp;
try {
    // Check if we already have an initialized app
    try {
        firebaseApp = admin.app();
        console.log('✅ Firebase Admin already initialized');
    } catch (error) {
        // No app exists, initialize one
        console.log('🔐 Initializing Firebase Admin...');
        
        if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
            // Using service account key file (development)
            firebaseApp = admin.initializeApp({
                credential: admin.credential.applicationDefault(),
                projectId: process.env.FIREBASE_PROJECT_ID || 'erania-d9833'
            });
            console.log('✅ Firebase Admin initialized with service account file');
        } else if (process.env.NODE_ENV === 'production') {
            // Production: Use default credentials (automatically provided by Firebase/GCP)
            firebaseApp = admin.initializeApp({
                projectId: 'erania-d9833'
            });
            console.log('✅ Firebase Admin initialized with default credentials');
        } else {
            // Development fallback: Try default credentials
            try {
                firebaseApp = admin.initializeApp({
                    credential: admin.credential.applicationDefault(),
                    projectId: 'erania-d9833'
                });
                console.log('✅ Firebase Admin initialized with default credentials');
            } catch (fallbackError) {
                console.error('❌ Firebase initialization failed. Please set GOOGLE_APPLICATION_CREDENTIALS or ensure service account is available.');
                throw fallbackError;
            }
        }
    }
    
    // Test Firebase connection
    admin.firestore().settings({ ignoreUndefinedProperties: true });
    console.log('✅ Firestore connection established');
    
} catch (error) {
    console.error('❌ Error initializing Firebase Admin:', error.message);
    if (error.code) {
        console.error('Error code:', error.code);
    }
    process.exit(1);
}

const db = admin.firestore();

// Routes

// Get all items
app.get('/api/products', async (req, res) => {
    try {
        const items = [];
        
        // Get regular products from main collection
        const itemsRef = db.collection('Products');
        const snapshot = await itemsRef.get();
        
        // Process each main product document
        for (const doc of snapshot.docs) {
            const data = doc.data();
            const productName = doc.id;
            
            console.log(`Processing product: ${productName}`);
            
            try {
                // Get all subcollections under this product document
                const productRef = db.collection('Products').doc(productName);
                const collections = await productRef.listCollections();
                
                console.log(`Found ${collections.length} subcollections for ${productName}`);
                
                if (collections.length > 0) {
                    // This is a hierarchical product with variants - don't add the main document
                    // Process each subcollection (e.g., cloth types)
                    for (const collection of collections) {
                        const collectionName = collection.id;
                        console.log(`Processing subcollection: ${productName}/${collectionName}`);
                        
                        const subSnapshot = await collection.get();
                        
                        // Process each document in the subcollection
                        subSnapshot.forEach(subDoc => {
                            const subData = subDoc.data();
                            const documentName = subDoc.id;
                            const subcollectionPath = `Products/${productName}/${collectionName}/${documentName}`;
                            
                            console.log(`Found subcollection document: ${subcollectionPath}`);
                            
                            // Parse document name if it follows Gender-Size pattern
                            const [gender, size] = documentName.includes('-') ? 
                                documentName.split('-') : [documentName, 'N/A'];
                            
                            // Create subcollection product entry
                            items.push({
                                id: `${productName}_${collectionName}_${documentName}`,
                                type: 'subcollection',
                                Name: productName,
                                Cloth: collectionName,
                                Gender: gender || 'N/A',
                                Size: size || 'N/A',
                                subcollectionPath: subcollectionPath,
                                ...subData,
                                // Convert Firestore timestamps to ISO strings for JSON serialization
                                createdAt: subData.createdAt?.toDate?.()?.toISOString() || null,
                                updatedAt: subData.updatedAt?.toDate?.()?.toISOString() || null
                            });
                        });
                    }
                } else {
                    // This is a regular product without variants - add the main document
                    items.push({
                        id: doc.id,
                        type: 'main',
                        ...data,
                        // Convert Firestore timestamps to ISO strings for JSON serialization
                        createdAt: data.createdAt?.toDate?.()?.toISOString() || null,
                        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || null
                    });
                }
            } catch (subError) {
                console.log(`No subcollections found for ${productName} or error accessing them:`, subError.message);
                // If there's an error checking subcollections, treat it as a regular product
                items.push({
                    id: doc.id,
                    type: 'main',
                    ...data,
                    // Convert Firestore timestamps to ISO strings for JSON serialization
                    createdAt: data.createdAt?.toDate?.()?.toISOString() || null,
                    updatedAt: data.updatedAt?.toDate?.()?.toISOString() || null
                });
            }
        }
        
        console.log(`Total items found: ${items.length}`);
        res.json(items);
    } catch (error) {
        console.error('Error getting items:', error);
        res.status(500).json({ error: 'Failed to retrieve items' });
    }
});

// Get all categories
app.get('/api/categories', async (req, res) => {
    try {
        const categoriesRef = db.collection('Categories');
        const snapshot = await categoriesRef.get();
        
        const categories = [];
        snapshot.forEach(doc => {
            const data = doc.data();
            // Handle both 'Name' and 'name' field variations
            const categoryName = data.Name || data.name;
            if (categoryName) {
                categories.push(categoryName);
            }
        });
        
        res.json(categories);
    } catch (error) {
        console.error('Error getting categories:', error);
        res.status(500).json({ error: 'Failed to retrieve categories' });
    }
});

// Add new item
app.post('/api/products', async (req, res) => {
    try {
        const { 
            Name, 
            Category, 
            Price, 
            Discount, 
            Stock, 
            Sold,
            Barcode, 
            Image, 
            Cloth, 
            Gender, 
            Size
        } = req.body;
        
        // Validation
        if (!Name || !Category || !Gender || !Size) {
            return res.status(400).json({ 
                error: 'Name, category, gender, and size are required' 
            });
        }
        
        const newItem = {
            Name: Name.trim(),
            Category: Category,
            Price: Price ? parseFloat(Price) : 0,
            Discount: Discount ? parseFloat(Discount) : 0,
            Stock: Stock ? parseInt(Stock) : 0,
            Sold: Sold ? parseInt(Sold) : 0,
            Barcode: Barcode ? Barcode.trim() : '',
            Image: Image ? Image.trim() : '',
            Cloth: Cloth || 'NA',
            Gender: Gender,
            Size: Size
        };
        
        // Create hierarchical structure if Cloth, Gender and Size are provided
        let docRef;
        if (Cloth && Cloth !== 'NA' && Gender && Size) {
            // Structure: Products/Name/Cloth/Gender-Size
            const genderSize = `${Gender}-${Size}`;
            
            // First, create or update the main product document with basic info
            const mainDocRef = db.collection('Products').doc(Name.trim());
            const mainDocData = {
                Name: Name.trim(),
                Category: Category,
                hasVariants: true // Flag to indicate this product has variants
            };
            
            // Check if main document exists, if not create it
            const mainDoc = await mainDocRef.get();
            if (!mainDoc.exists) {
                await mainDocRef.set(mainDocData);
            }
            
            // Then create the subcollection document with full product data
            docRef = mainDocRef.collection(Cloth).doc(genderSize);
        } else {
            // Use simple product name as document ID
            docRef = db.collection('Products').doc(Name.trim());
        }
        
        await docRef.set(newItem);
        
        res.status(201).json({
            id: Name.trim(),
            message: 'Item created successfully'
        });
    } catch (error) {
        console.error('Error adding item:', error);
        res.status(500).json({ error: 'Failed to add item' });
    }
});

// Update item
app.put('/api/products/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { 
            Name, 
            Category, 
            Price, 
            Discount, 
            Stock, 
            Barcode, 
            Image, 
            Cloth, 
            Gender, 
            Size 
        } = req.body;
        
        console.log('Update request for ID:', id);
        console.log('Request body:', req.body);
        
        // Validation
        if (!Name || !Category || !Gender || !Size) {
            console.log('Validation failed:', { Name, Category, Gender, Size });
            return res.status(400).json({ 
                error: 'Name, category, gender, and size are required',
                received: { Name, Category, Gender, Size }
            });
        }
        
        const updateData = {
            Name: Name.trim(),
            Category: Category,
            Price: Price ? parseFloat(Price) : 0,
            Discount: Discount ? parseFloat(Discount) : 0,
            Stock: Stock ? parseInt(Stock) : 0,
            Barcode: Barcode ? Barcode.trim() : '',
            Image: Image ? Image.trim() : '',
            Cloth: Cloth || 'NA',
            Gender: Gender,
            Size: Size
        };
        
        // Handle hierarchical structure for updates
        let docRef;
        if (req.body.subcollectionPath) {
            // Update subcollection document using the path from frontend
            const pathParts = req.body.subcollectionPath.split('/');
            // Format: Products/Name/Cloth/Gender-Size
            if (pathParts.length === 4) {
                const [, productName, cloth, genderSize] = pathParts;
                docRef = db.collection('Products')
                          .doc(productName)
                          .collection(cloth)
                          .doc(genderSize);
            } else {
                docRef = db.collection('Products').doc(id);
            }
        } else if (Cloth && Cloth !== 'NA' && Gender && Size) {
            // Create new hierarchical structure
            const genderSize = `${Gender}-${Size}`;
            docRef = db.collection('Products')
                      .doc(Name.trim())
                      .collection(Cloth)
                      .doc(genderSize);
        } else {
            // Update simple product
            docRef = db.collection('Products').doc(id);
        }
        
        await docRef.update(updateData);
        
        res.json({ message: 'Item updated successfully' });
    } catch (error) {
        console.error('Error updating item:', error);
        res.status(500).json({ error: 'Failed to update item' });
    }
});

// Delete item
app.delete('/api/products/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { subcollectionPath } = req.body;
        
        // Handle hierarchical structure for deletion
        let docRef;
        if (subcollectionPath) {
            // Delete subcollection document using the path
            const pathParts = subcollectionPath.split('/');
            // Format: Products/Name/Cloth/Gender-Size
            if (pathParts.length === 4) {
                const [, productName, cloth, genderSize] = pathParts;
                docRef = db.collection('Products')
                          .doc(productName)
                          .collection(cloth)
                          .doc(genderSize);
            } else {
                docRef = db.collection('Products').doc(id);
            }
        } else {
            // Delete simple product
            docRef = db.collection('Products').doc(id);
        }
        
        await docRef.delete();
        
        res.json({ message: 'Item deleted successfully' });
    } catch (error) {
        console.error('Error deleting item:', error);
        res.status(500).json({ error: 'Failed to delete item' });
    }
});

// Get single item
app.get('/api/products/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        // Check if this is a composite ID for hierarchical products
        if (id.includes('_')) {
            // Parse composite ID: productName_clothType_genderSize
            const parts = id.split('_');
            if (parts.length === 3) {
                const [productName, clothType, genderSize] = parts;
                
                // Get from hierarchical structure: Products/Name/Cloth/Gender-Size
                const doc = await db.collection('Products')
                    .doc(productName)
                    .collection(clothType)
                    .doc(genderSize)
                    .get();
                
                if (!doc.exists) {
                    return res.status(404).json({ error: 'Item not found' });
                }
                
                const item = {
                    id: id, // Use the composite ID
                    subcollectionPath: `Products/${productName}/${clothType}/${genderSize}`,
                    ...doc.data(),
                    createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || null,
                    updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString() || null
                };
                
                return res.json(item);
            }
        }
        
        // Handle regular products (non-hierarchical)
        const doc = await db.collection('Products').doc(id).get();
        
        if (!doc.exists) {
            return res.status(404).json({ error: 'Item not found' });
        }
        
        const item = {
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || null,
            updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString() || null
        };
        
        res.json(item);
    } catch (error) {
        console.error('Error getting item:', error);
        res.status(500).json({ error: 'Failed to retrieve item' });
    }
});

// Get GlobalVariablesP/Global settings
app.get('/api/GlobalVariablesP/Global', async (req, res) => {
    try {
        const db = admin.firestore();
        const doc = await db.collection('GlobalVariablesP').doc('Global').get();
        
        if (doc.exists) {
            const data = doc.data();
            res.json({ data });
        } else {
            // If document doesn't exist, return default structure
            const defaultSettings = {
                Name: '',
                Rfc: '',
                Email: '',
                Phone: '',
                Address: '',
                Colony: '',
                Zip: '',
                DiscountGlobal: 0,
                SalesGoal: 0,
                SalesQtyGoal: 0,
                LastTicketNumber: 0,
                SmallBox: 0,
                Spendings: 0,
                TotalQtySales: 0,
                TotalSales: 0,
                Currency: 'MXN'
            };
            res.json({ data: defaultSettings });
        }
    } catch (error) {
        console.error('Error retrieving GlobalVariablesP/Global:', error);
        res.status(500).json({ error: 'Failed to retrieve settings' });
    }
});

// Update GlobalVariablesP/Global settings
app.put('/api/GlobalVariablesP/Global', async (req, res) => {
    try {
        const db = admin.firestore();
        const settingsData = req.body;
        
        // Ensure numeric fields are properly converted
        const numericFields = ['DiscountGlobal', 'SalesGoal', 'SalesQtyGoal', 'LastTicketNumber', 'SmallBox', 'Spendings', 'TotalQtySales', 'TotalSales'];
        numericFields.forEach(field => {
            if (settingsData[field] !== undefined) {
                settingsData[field] = parseFloat(settingsData[field]) || 0;
            }
        });
        
        console.log('Updating GlobalVariablesP/Global with:', settingsData);
        
        await db.collection('GlobalVariablesP').doc('Global').set(settingsData, { merge: true });
        
        console.log('GlobalVariablesP/Global updated successfully');
        res.json({ 
            success: true, 
            message: 'Settings updated successfully',
            data: settingsData 
        });
    } catch (error) {
        console.error('Error updating GlobalVariablesP/Global:', error);
        res.status(500).json({ error: 'Failed to update settings' });
    }
});

// Users Management Endpoints

// Get all users
app.get('/api/users', async (req, res) => {
    try {
        const db = admin.firestore();
        const usersSnapshot = await db.collection('Users').get();
        
        if (usersSnapshot.empty) {
            console.log('No users found');
            res.json([]);
            return;
        }
        
        const users = [];
        usersSnapshot.forEach(doc => {
            users.push({
                id: doc.id,
                data: doc.data()
            });
        });
        
        console.log(`Retrieved ${users.length} users`);
        res.json(users);
    } catch (error) {
        console.error('Error retrieving users:', error);
        res.status(500).json({ error: 'Failed to retrieve users', message: error.message });
    }
});

// Get a specific user by email (document ID)
app.get('/api/users/:email', async (req, res) => {
    try {
        const db = admin.firestore();
        const email = decodeURIComponent(req.params.email);
        
        const userDoc = await db.collection('Users').doc(email).get();
        
        if (!userDoc.exists) {
            console.log(`User not found: ${email}`);
            res.status(404).json({ error: 'User not found', message: `No user found with email: ${email}` });
            return;
        }
        
        const userData = userDoc.data();
        console.log(`Retrieved user: ${email}`);
        
        res.json({
            id: userDoc.id,
            data: userData
        });
    } catch (error) {
        console.error('Error retrieving user:', error);
        res.status(500).json({ error: 'Failed to retrieve user', message: error.message });
    }
});

// Add a new user
app.post('/api/users', async (req, res) => {
    try {
        const db = admin.firestore();
        const userData = req.body;
        
        // Validate required fields
        if (!userData.Email) {
            res.status(400).json({ error: 'Email is required' });
            return;
        }
        
        if (!userData.Password) {
            res.status(400).json({ error: 'Password is required' });
            return;
        }
        
        if (!userData.Role) {
            res.status(400).json({ error: 'Role is required' });
            return;
        }
        
        if (userData.Access === undefined || userData.Access === null) {
            res.status(400).json({ error: 'Access is required' });
            return;
        }
        
        const email = userData.Email;
        
        // Check if user already exists
        const existingUser = await db.collection('Users').doc(email).get();
        if (existingUser.exists) {
            res.status(409).json({ error: 'User already exists', message: `User with email ${email} already exists` });
            return;
        }
        
        // Ensure Access is boolean
        userData.Access = userData.Access === true || userData.Access === 'true';
        
        // Use email as document ID
        await db.collection('Users').doc(email).set(userData);
        
        console.log('User added successfully:', email);
        res.json({ 
            message: 'User added successfully', 
            id: email,
            data: userData
        });
    } catch (error) {
        console.error('Error adding user:', error);
        res.status(500).json({ error: 'Failed to add user', message: error.message });
    }
});

// Update a user
app.put('/api/users/:email', async (req, res) => {
    try {
        const db = admin.firestore();
        const email = decodeURIComponent(req.params.email);
        const userData = req.body;
        
        // Check if user exists
        const userDoc = await db.collection('Users').doc(email).get();
        if (!userDoc.exists) {
            res.status(404).json({ error: 'User not found', message: `No user found with email: ${email}` });
            return;
        }
        
        // Ensure Access is boolean
        if (userData.Access !== undefined) {
            userData.Access = userData.Access === true || userData.Access === 'true';
        }
        
        // If email is being changed, we need to create a new document and delete the old one
        if (userData.Email && userData.Email !== email) {
            const newEmail = userData.Email;
            
            // Check if new email already exists
            const existingUser = await db.collection('Users').doc(newEmail).get();
            if (existingUser.exists) {
                res.status(409).json({ error: 'Email already exists', message: `User with email ${newEmail} already exists` });
                return;
            }
            
            // Create new document with new email as ID
            await db.collection('Users').doc(newEmail).set(userData);
            
            // Delete old document
            await db.collection('Users').doc(email).delete();
            
            console.log(`User updated and moved from ${email} to ${newEmail}`);
            res.json({ 
                message: 'User updated successfully', 
                id: newEmail,
                oldId: email,
                data: userData
            });
        } else {
            // Just update existing document
            await db.collection('Users').doc(email).set(userData, { merge: true });
            
            console.log('User updated successfully:', email);
            res.json({ 
                message: 'User updated successfully', 
                id: email,
                data: userData
            });
        }
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ error: 'Failed to update user', message: error.message });
    }
});

// Delete a user
app.delete('/api/users/:email', async (req, res) => {
    try {
        const db = admin.firestore();
        const email = decodeURIComponent(req.params.email);
        
        // Check if user exists
        const userDoc = await db.collection('Users').doc(email).get();
        if (!userDoc.exists) {
            res.status(404).json({ error: 'User not found', message: `No user found with email: ${email}` });
            return;
        }
        
        // Delete the user document
        await db.collection('Users').doc(email).delete();
        
        console.log('User deleted successfully:', email);
        res.json({ message: 'User deleted successfully', id: email });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ error: 'Failed to delete user', message: error.message });
    }
});

// Categories Management Endpoints

// Get all categories for management
app.get('/api/categories-management', async (req, res) => {
    try {
        const db = admin.firestore();
        const categoriesSnapshot = await db.collection('Categories').get();
        
        if (categoriesSnapshot.empty) {
            console.log('No categories found');
            res.json([]);
            return;
        }
        
        const categories = [];
        categoriesSnapshot.forEach(doc => {
            categories.push({
                id: doc.id,
                data: doc.data()
            });
        });
        
        console.log(`Retrieved ${categories.length} categories for management`);
        res.json(categories);
    } catch (error) {
        console.error('Error retrieving categories for management:', error);
        res.status(500).json({ error: 'Failed to retrieve categories', message: error.message });
    }
});

// Add a new category
app.post('/api/categories-management', async (req, res) => {
    try {
        const db = admin.firestore();
        const categoryData = req.body;
        
        // Validate required fields
        if (!categoryData.Name) {
            res.status(400).json({ error: 'Name is required' });
            return;
        }
        
        const categoryName = categoryData.Name.trim();
        
        if (!categoryName) {
            res.status(400).json({ error: 'Category name cannot be empty' });
            return;
        }
        
        // Check if category already exists
        const existingCategory = await db.collection('Categories').doc(categoryName).get();
        if (existingCategory.exists) {
            res.status(409).json({ error: 'Category already exists', message: `Category "${categoryName}" already exists` });
            return;
        }
        
        // Use category name as document ID
        await db.collection('Categories').doc(categoryName).set(categoryData);
        
        console.log('Category added successfully:', categoryName);
        res.json({ 
            message: 'Category added successfully', 
            id: categoryName,
            data: categoryData
        });
    } catch (error) {
        console.error('Error adding category:', error);
        res.status(500).json({ error: 'Failed to add category', message: error.message });
    }
});

// Delete a category
app.delete('/api/categories-management/:name', async (req, res) => {
    try {
        const db = admin.firestore();
        const categoryName = decodeURIComponent(req.params.name);
        
        // Check if category exists
        const categoryDoc = await db.collection('Categories').doc(categoryName).get();
        if (!categoryDoc.exists) {
            res.status(404).json({ error: 'Category not found', message: `No category found with name: ${categoryName}` });
            return;
        }
        
        // Check if category is being used by any products
        try {
            const productsSnapshot = await db.collection('Products')
                .where('Category', '==', categoryName)
                .limit(1)
                .get();
            
            if (!productsSnapshot.empty) {
                res.status(409).json({ 
                    error: 'Category in use', 
                    message: `Cannot delete category "${categoryName}" because it is being used by existing products. Please update or delete those products first.` 
                });
                return;
            }
        } catch (productCheckError) {
            console.warn('Could not check for product usage:', productCheckError);
            // Continue with deletion even if product check fails
        }
        
        // Delete the category document
        await db.collection('Categories').doc(categoryName).delete();
        
        console.log('Category deleted successfully:', categoryName);
        res.json({ message: 'Category deleted successfully', id: categoryName });
    } catch (error) {
        console.error('Error deleting category:', error);
        res.status(500).json({ error: 'Failed to delete category', message: error.message });
    }
});

// ===================
// CLIENT MANAGEMENT ENDPOINTS
// ===================

// Get all clients
app.get('/api/clients', async (req, res) => {
    try {
        console.log('Fetching all clients...');
        const snapshot = await db.collection('Clients').get();
        
        const clients = [];
        snapshot.forEach(doc => {
            clients.push({
                id: doc.id,
                data: doc.data()
            });
        });
        
        console.log(`Found ${clients.length} clients`);
        res.json(clients);
    } catch (error) {
        console.error('Error fetching clients:', error);
        res.status(500).json({ error: 'Failed to fetch clients', message: error.message });
    }
});

// Get a single client by phone
app.get('/api/clients/:phone', async (req, res) => {
    try {
        const phone = req.params.phone;
        console.log('Fetching client with phone:', phone);
        
        const doc = await db.collection('Clients').doc(phone).get();
        
        if (!doc.exists) {
            return res.status(404).json({ error: 'Client not found' });
        }
        
        const client = {
            id: doc.id,
            data: doc.data()
        };
        
        console.log('Client found:', client);
        res.json(client);
    } catch (error) {
        console.error('Error fetching client:', error);
        res.status(500).json({ error: 'Failed to fetch client', message: error.message });
    }
});

// Create a new client
app.post('/api/clients', async (req, res) => {
    try {
        const clientData = req.body;
        console.log('Creating new client:', clientData);
        
        if (!clientData.Phone) {
            return res.status(400).json({ error: 'Phone is required' });
        }
        
        // Validate data types
        const processedData = {
            Phone: clientData.Phone.toString().trim(),
            Purchased: parseInt(clientData.Purchased) || 0,
            Discount: parseFloat(clientData.Discount) || 0
        };
        
        // Use phone as document ID
        const phone = processedData.Phone;
        
        // Check if client already exists
        const existingDoc = await db.collection('Clients').doc(phone).get();
        if (existingDoc.exists) {
            return res.status(400).json({ error: 'Client with this phone number already exists' });
        }
        
        // Create the client document
        await db.collection('Clients').doc(phone).set(processedData);
        
        console.log('Client created successfully with phone:', phone);
        res.status(201).json({ message: 'Client created successfully', id: phone, data: processedData });
    } catch (error) {
        console.error('Error creating client:', error);
        res.status(500).json({ error: 'Failed to create client', message: error.message });
    }
});

// Update a client
app.put('/api/clients/:phone', async (req, res) => {
    try {
        const phone = req.params.phone;
        const clientData = req.body;
        console.log('Updating client:', phone, clientData);
        
        if (!clientData.Phone) {
            return res.status(400).json({ error: 'Phone is required' });
        }
        
        // Validate data types
        const processedData = {
            Phone: clientData.Phone.toString().trim(),
            Purchased: parseInt(clientData.Purchased) || 0,
            Discount: parseFloat(clientData.Discount) || 0
        };
        
        // Check if client exists
        const existingDoc = await db.collection('Clients').doc(phone).get();
        if (!existingDoc.exists) {
            return res.status(404).json({ error: 'Client not found' });
        }
        
        // Update the client document
        await db.collection('Clients').doc(phone).update(processedData);
        
        console.log('Client updated successfully:', phone);
        res.json({ message: 'Client updated successfully', id: phone, data: processedData });
    } catch (error) {
        console.error('Error updating client:', error);
        res.status(500).json({ error: 'Failed to update client', message: error.message });
    }
});

// Delete a client
app.delete('/api/clients/:phone', async (req, res) => {
    try {
        const phone = req.params.phone;
        console.log('Deleting client:', phone);
        
        // Check if client exists
        const existingDoc = await db.collection('Clients').doc(phone).get();
        if (!existingDoc.exists) {
            return res.status(404).json({ error: 'Client not found' });
        }
        
        // Delete the client document
        await db.collection('Clients').doc(phone).delete();
        
        console.log('Client deleted successfully:', phone);
        res.json({ message: 'Client deleted successfully', id: phone });
    } catch (error) {
        console.error('Error deleting client:', error);
        res.status(500).json({ error: 'Failed to delete client', message: error.message });
    }
});

// ===================
// TICKETS ENDPOINTS
// ===================

// Get all tickets
app.get('/api/tickets', async (req, res) => {
    try {
        console.log('Fetching all tickets...');
        const snapshot = await db.collection('Tickets').get();
        
        const tickets = [];
        snapshot.forEach(doc => {
            const data = doc.data();
            // Filter tickets where ID equals TicketID as requested
            if (doc.id === data.TicketID) {
                tickets.push({
                    id: doc.id,
                    data: data
                });
            }
        });
        
        console.log(`Found ${tickets.length} tickets with matching ID and TicketID`);
        res.json(tickets);
    } catch (error) {
        console.error('Error fetching tickets:', error);
        res.status(500).json({ error: 'Failed to fetch tickets', message: error.message });
    }
});

// ===================
// SPENDINGS ENDPOINTS
// ===================

// Get all spendings from SpendingsG collection
app.get('/api/spendings', async (req, res) => {
    try {
        console.log('Fetching all spendings from SpendingsG...');
        const snapshot = await db.collection('SpendingsG').get();
        
        const spendings = [];
        snapshot.forEach(doc => {
            const docId = doc.id;
            // Check if document ID matches date format (dd-mm-yyyy)
            const dateRegex = /^\d{1,2}-\d{1,2}-\d{4}$/;
            if (dateRegex.test(docId)) {
                spendings.push({
                    id: docId,
                    data: doc.data()
                });
            }
        });
        
        console.log(`Found ${spendings.length} spending documents with date format`);
        res.json(spendings);
    } catch (error) {
        console.error('Error fetching spendings:', error);
        res.status(500).json({ error: 'Failed to fetch spendings', message: error.message });
    }
});

// Sales Statistics endpoints
app.get('/api/sales-statistics', async (req, res) => {
    try {
        const db = admin.firestore();
        const salesStatsSnapshot = await db.collection('SalesStatistics').get();
        
        const salesStats = salesStatsSnapshot.docs
            .filter(doc => {
                const docId = doc.id;
                // Check if document ID follows the expected format "monthyear" like "diciembre2025"
                return /^[a-záéíóúü]+\d{4}$/i.test(docId);
            })
            .map(doc => ({
                id: doc.id,
                data: doc.data()
            }));
            
        console.log(`Found ${salesStats.length} sales statistics documents`);
        res.json(salesStats);
    } catch (error) {
        console.error('Error fetching sales statistics:', error);
        res.status(500).json({ error: 'Failed to fetch sales statistics', message: error.message });
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        message: 'Firestore Web App API is running'
    });
});

// Serve the frontend
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Error handling middleware
app.use((error, req, res, next) => {
    console.error('Unhandled error:', error);
    res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📊 API endpoints available at http://localhost:${PORT}/api/products`);
    console.log(`🌐 Web interface available at http://localhost:${PORT}`);
});