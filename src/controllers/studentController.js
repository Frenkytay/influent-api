const Student = require("../models/Student");

exports.getAll = async (req, res) => {
  try {
    const {
      university,
      major,
      year,
      gpa,
      status,
      sort,
      order = "ASC",
      limit = 20,
      offset = 0,
    } = req.query;
    const where = {};
    if (university)
      where.university = { [require("sequelize").Op.like]: `%${university}%` };
    if (major) where.major = { [require("sequelize").Op.like]: `%${major}%` };
    if (year) where.year = year;
    if (gpa) where.gpa = gpa;
    if (status) where.status = status;

    const options = {
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
    };
    if (sort) options.order = [[sort, order.toUpperCase()]];

    const students = await Student.findAll(options);
    res.json(students);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch students" });
  }
};

exports.getById = async (req, res) => {
  try {
    const student = await Student.findByPk(req.params.id);
    if (!student) return res.status(404).json({ error: "Not found" });
    res.json(student);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch student" });
  }
};

exports.create = async (req, res) => {
  try {
    const student = await Student.create(req.body);
    res.status(201).json(student);
  } catch (err) {
    res.status(400).json({ error: "Failed to create student" });
  }
};

exports.update = async (req, res) => {
  try {
    const student = await Student.findByPk(req.params.id);
    if (!student) return res.status(404).json({ error: "Not found" });
    await student.update(req.body);
    res.json(student);
  } catch (err) {
    res.status(400).json({ error: "Failed to update student" });
  }
};

exports.delete = async (req, res) => {
  try {
    const student = await Student.findByPk(req.params.id);
    if (!student) return res.status(404).json({ error: "Not found" });
    await student.destroy();
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(400).json({ error: "Failed to delete student" });
  }
};
