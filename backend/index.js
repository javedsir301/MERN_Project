const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const FormDataModel = require('./models/FormData');

const app = express();

const allowedOrigins = [
  'https://mern-project-javedsir301s-projects.vercel.app',
  'https://mern-project-gamma-nine.vercel.app'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log(`Blocked by CORS: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type']
}));


app.use(express.json());

const PORT = process.env.PORT || 3001;

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("MongoDB connected");

    const adminEmail = "admin@hyperverge.co";
    const adminPassword = "admin123";
    const adminName = "Admin";

    FormDataModel.findOne({ email: adminEmail }).then(admin => {
      if (!admin) {
        FormDataModel.create({
          name: adminName,
          email: adminEmail,
          password: adminPassword,
          role: "admin"
        }).then(() => console.log("Admin user created"));
      }
    });
  })
  .catch(err => console.error("MongoDB connection error:", err));

app.get('/', (req, res) => {
  res.send({ activeStatus: true, error: false });
});

app.post('/register', (req, res) => {
    const { email } = req.body;
    FormDataModel.findOne({ email }).then(user => {
        if (user) {
            res.json("Already registered");
        } else {
            FormDataModel.create(req.body)
                .then(newUser => res.json(newUser))
                .catch(err => res.json(err));
        }
    });
});

app.post('/login', (req, res) => {
    const { email, password } = req.body;
    FormDataModel.findOne({ email }).then(user => {
        if (user) {
            if (user.password === password) {
                res.json({ message: "Success", role: user.role });
            } else {
                res.json({ message: "Wrong password" });
            }
        } else {
            res.json({ message: "No records found!" });
        }
    });
});


app.listen(PORT, () => console.log(`Server running on port ${PORT}`));