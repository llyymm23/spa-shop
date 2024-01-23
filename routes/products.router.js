import express from "express";
import Product from "../schemas/products.schema.js";

const router = express.Router();

/*상품 작성 api*/
//상품명, 작성 내용, 작성자명, 비밀번호를 **request**에서 전달 받기
//상품은 두 가지 상태, **판매 중(`FOR_SALE`)및 판매 완료(`SOLD_OUT`)** 를 가질 수 있습니다.
//상품 등록 시 기본 상태는 **판매 중(`FOR_SALE`)** 입니다.
router.post("/products", async (req, res, next) => {
  try {
    const { title, content, author, password } = req.body;

    if (!(title && content && author && password)) {
      return res
        .status(400)
        .json({ errorMessage: "데이터 형식이 올바르지 않습니다." });
    }

    const product = new Product({ title, content, author, password, });
    await product.save();

    return res.status(201).json({ message: "판매 상품을 등록하였습니다." });
  }
  catch (error) {
    return res.status(500).json({ message: "예기치 못한 에러가 발생하였습니다." });
  }
});

/* 상품 목록 조회 api */
//상품명, 작성자명, 상품 상태, 작성 날짜 조회
//작성 날짜 기준으로 내림차순
router.get("/products", async (req, res, next) => {
  try {
    const products = await Product.find().select("_id title author status createdAt").sort("-createdAt").exec();

    return res.status(200).json({ products });
  } catch (error) {
    return res.status(500).json({ message: "예기치 못한 에러가 발생하였습니다." });
  }
});

/* 상품 상세 조회 api */
//상품명, 작성내용, 작성자명, 상품상태, 작성 날짜 조회
router.get("/products/:productId", async (req, res, next) => {
  try {
    const { productId } = req.params;

    const data = await Product.findById(productId).exec();

    if (!data) {
      return res.status(404).json({ message: "상품 조회에 실패하였습니다." });
    }

    const title = data.title;
    const content = data.content;
    const author = data.author;
    const status = data.status;
    const createdAt = data.createdAt;

    return res.status(200).json({
      data: { productId, title, content, author, status, createdAt },
    });
  } catch (error) {
    return res.status(500).json({ message: "예기치 못한 에러가 발생하였습니다." });
  }
});

/* 상품 정보 수정 api */
//상품명, 작성 내용, 상품 상태, 비밀번호를 request에서 전달받기
//수정할 상품과 비밀번호 일치 여부를 확인한 후, 동일할 때만 글이 수정되게 하기
//선택한 상품이 존재하지 않을 경우, “상품 조회에 실패하였습니다." 메시지 반환하기
router.patch("/products/:productId", async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { title, content, status, password } = req.body;

    const currentProduct = await Product.findById(productId).exec();

    if (!(title && content && password && status)) {
      return res
        .status(400)
        .json({ errorMessage: "데이터 형식이 올바르지 않습니다." });
    }

    if (!currentProduct) {
      return res.status(404).json({ message: "상품 조회에 실패하였습니다." });
    }

    if (password == currentProduct.password) {
      currentProduct.title = title;
      currentProduct.content = content;
      currentProduct.status = status;
      currentProduct.password = password;
      await currentProduct.save();

      return res.status(201).json({ message: "상품 정보를 수정하였습니다." });
    }

    if (password !== currentProduct.password) {
      return res.status(401).json({ message: "상품을 수정할 권한이 존재하지 않습니다." });
    }
  } catch (error) {
    return res.status(500).json({ message: "예기치 못한 에러가 발생하였습니다." });
  }
});

/* 상품 삭제 api */
//비밀번호를 **request**에서 전달받기
//수정할 상품과 비밀번호 일치 여부를 확인한 후, 동일할 때만 글이 **삭제**되게 하기
//선택한 상품이 존재하지 않을 경우, “상품 조회에 실패하였습니다." 메시지 반환하기
router.delete("/products/:productId", async (req, res, next) => {
  try {
    const { productId } = req.params;
    const delProduct = await Product.findById(productId).exec();
    const { password } = req.body;
    if (!delProduct) {
      return res.status(404).json({ message: "상품 조회에 실패하였습니다." });
    }

    if (password == delProduct.password) {
      await Product.deleteOne({ _id: productId });

      return res.status(200).json({ message: "상품을 삭제하였습니다." });
    }

    if (password !== delProduct.password) {
      return res
        .status(401)
        .json({ message: "상품을 삭제할 권한이 존재하지 않습니다." });
    }
  } catch (error) {
    return res.status(500).json({ message: "예기치 못한 에러가 발생하였습니다." });
  }
});

export default router;
