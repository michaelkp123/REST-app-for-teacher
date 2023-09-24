import { mongoose } from "mongoose";

const { Schema } = mongoose;

const courseSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      minLength: [3, "That's too short"],
    },
    education: {
      type: String,
      required: [true, "Education is required"],
    },
    startDate: {
      type: Date,
      required: [true, "Start date is required"],
    },
    endDate: {
      type: Date,
      required: [true, "End date is required"],
      validate: {
        validator: function (value) {
          // Ensure endDate is not before startDate
          return !this.startDate || value >= this.startDate;
        },
        message: "End date must be equal to or after the start date",
      },
    },
    ects: {
      type: Number,
      required: [true, "ECTS is required"],
    },
    semester: {
      type: String,
      required: [true, "Semester is required"],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
    },
    responsibleTeacher: {
      type: Schema.Types.ObjectId,
      ref: "Teacher",
      required: [true, "Responsible teacher is required"],
    },
  },
  { timestamps: true }
);


const lessonSchema = new Schema(
  {
    courseId: {
      type: Schema.Types.ObjectId,
      ref: "Course",
      required: [true, "Course ID is required"],
    },
    date: {
      type: Date,
      required: [true, "Date is required"],
    },
    time: {
      type: String,
      required: [true, "Time is required"],
    },
    responsibleTeacher: {
      type: Schema.Types.ObjectId,
      ref: "Teacher",
      required: [true, "Responsible teacher is required"],
    },
    title: {
      type: String,
      required: [true, "Title is required"],
    },
    content: {
      type: String,
      required: [true, "Content is required"],
    },
  },
  { timestamps: true }
);

const teacherSchema = new Schema({
  teacherName: {
    type: String,
    required: [true, "Teacher name is required"],
    trim: true,
    minLength: [3, "That's too short"],
  },
  password: {
    type: String,
    required: [true, "Password is required"],
    trim: true,
    minLength: [3, "That's too short"],
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    trim: true,
    lowercase: true,
    unique: [true, "Email address is already in use"],
    validate: {
      validator: (value) => {
        // Simple email validation using regex
        return /^\S+@\S+\.\S+$/.test(value);
      },
      message: "Invalid email address",
    },
  },
});

export const models = [
  {
    name: "Course",
    schema: courseSchema,
    collection: "courses",
  },
  {
    name: "Lesson",
    schema: lessonSchema,
    collection: "lesson",
  },
  {
    name: "Teacher",
    schema: teacherSchema,
    collection: "teacher",
  },
];