const mongoose = require("mongoose");
const Schema   = mongoose.Schema;

const courseSchema = new Schema({
  name:  String,
  description: String,
  teacher: {
    type: String,
    enum : ['JOC', 'Heitor', 'Danilo'],
    default : 'JOC'
  },
}, {
  timestamps: true
});

const Course = mongoose.model("Course", courseSchema);
module.exports = Course;