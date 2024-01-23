import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema({
  //상품명
  title: {
    type: String,
    required: true,
  },
  //작성 내용
  content: {
    type: String,
    required: true,
  },
  //작성자명
  author: {
    type: String,
    required: true,
  },
  //비밀번호
  password: {
    type: Number,
    required: true,
  },
  //상품상태
  status: {
    type: String,
    enum: ["FOR_SALE","SOLD_OUT"],
    default: "FOR_SALE",
  },
  //작성날짜
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("Product", ProductSchema);
