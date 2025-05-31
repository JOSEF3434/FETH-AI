//AppointmentsController.js
const Appointment = require("../models/Appointment");

exports.getAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({ lawyerId: req.user.id });
    console.log(appointments);  // Log the appointments
    res.json(appointments);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
};

exports.createAppointment = async (req, res) => {
  const { date, time, clientName } = req.body;
  const newAppointment = new Appointment({
    lawyerId: req.user.id,
    date,
    time,
    clientName,
    status: "pending",
  });

  try {
    await newAppointment.save();
    res.json(newAppointment);
  } catch (err) {
    res.status(500).send("Server error");
  }
};

exports.updateAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(appointment);
  } catch (err) {
    res.status(500).send("Server error");
  }
};

exports.addNote = async (req, res) => {
  const { note } = req.body;
  // Save the note in the database or handle as needed
  res.json({ message: "Note added" });
};
