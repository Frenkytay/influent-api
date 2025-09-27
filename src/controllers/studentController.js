import Student from "../models/Student.js";
import { Op } from "sequelize";

const getAll = async (req, res) => {
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
    if (university) where.university = { [Op.like]: `%${university}%` };
    if (major) where.major = { [Op.like]: `%${major}%` };
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

const getById = async (req, res) => {
  try {
    const student = await Student.findByPk(req.params.id);
    if (!student) return res.status(404).json({ error: "Not found" });
    res.json(student);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch student" });
  }
};

const create = async (req, res) => {
  try {
    const student = await Student.create(req.body);
    res.status(201).json(student);
  } catch (err) {
    res.status(400).json({ error: "Failed to create student" });
  }
};

const update = async (req, res) => {
  try {
    const student = await Student.findByPk(req.params.id);
    if (!student) return res.status(404).json({ error: "Not found" });
    await student.update(req.body);
    res.json(student);
  } catch (err) {
    res.status(400).json({ error: "Failed to update student" });
  }
};

const deleteStudent = async (req, res) => {
  try {
    const student = await Student.findByPk(req.params.id);
    if (!student) return res.status(404).json({ error: "Not found" });
    await student.destroy();
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(400).json({ error: "Failed to delete student" });
  }
};

export default {
  getAll,
  getById,
  create,
  update,
  delete: deleteStudent,
};
