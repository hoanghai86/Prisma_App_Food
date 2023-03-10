//B1: tạo file index.js
//B2: mở terminal gõ yarn init -y

//B3: cài 3 thư viên
//yarn add express nodemon dotenv

//B4: mở file package.json thêm   "scripts": {"start": "nodemon index.js"}

//B5: setup server express
const express = require("express")
const app = express();
//add một số middle awre để thực hiện các nhu cầu tương ứng
app.use(express.json()); //đọc được chuỗi json khi FE gửi chuỗi json trong body
app.use(express.static(".")); //định vị đường dẫn để load được tài nguyên trong project của mình, upload
//setup thêm CORS() để FE kết nối được BE

app.listen(8080);

//cài đặt
//tìm hiểu cấu trúc model
//tìm hiểu database first và code first
//tìm hiểu các hàm truy vấn dữ liệu của prisma
//cài 2 thư viện: yarn add prisma @prisma/client
//yarn prisma init: tạo cấu trúc thư mục prisma
//yarn prisma generate: khi xài khái niệm database first, phải làm mới lại file schema.prisma

const { PrismaClient } = require("@prisma/client")
const model = new PrismaClient();

//GET BY ID
app.get("/getUser/:user_id", async (req, res) => {
    try {
        let { user_id } = req.params;
        // let data = await model.user.findMany({ where: { user_id: Number(user_id) } });
        let data = await model.user.findMany({ where: { user_id: Number(user_id) } });
        res.send(data);
    } catch (error) {
        res.send(error);
    }
})

//JOIN
app.get("/joinLikeRes", async (req, res) => {
    try {
        let data = await model.like_res.findMany({
            include: {
                restaurant: true,
                user: true
            }
        });
        res.send(data);
    } catch (error) {
        res.send(error);
    }
})

//GET BY FULL_NAME
app.get("/getUser", async (req, res) => {
    try {
        let { full_name } = req.body;
        let data = await model.user.findMany({ where: { full_name: { contains: full_name } } });
        res.send(data);
    } catch (error) {
        res.send(error);
    }
})

//POST
app.post("/createUser", async (req, res) => {
    try {
        let { full_name, email, pass_word } = req.body;
        let data = { full_name, email, pass_word }
        await model.user.create({ data })

        res.send({ message: "Thêm thành công!", data });
    } catch (error) {
        res.send(JSON.stringify(error.message));
    }
})

//PUT
const fs = require("fs")
app.put("/updateUser/:user_id", async (req, res) => {
    try {
        let { user_id } = req.params;
        let { full_name, email, pass_word } = req.body;
        let data = { full_name, email, pass_word }
        await model.user.update({ data, where: { user_id: Number(user_id) } })
        res.send({ message: "Update thành công!", data })
    } catch (error) {
        // res.send(JSON.stringify(error.message));
        res.send(error)
        fs.writeFile("./log.txt", error.message, () => { })
    }
})

//yarn add multer => thư viện để lấy hình từ FE lưu xuống BE
const multer = require("multer")

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        //nơi định nghĩa đường dẫn lưu hình
        cb(null, process.cwd() + "/public/img")
    },
    //đổi tên file đang được úp lên
    filename: (req, file, cb) => {
        const newFileName = Date.now() + "-" + file.originalname //20230310-hinh.xxx
        cb(null, newFileName)
    }
})

const upload = multer({ storage })
app.post("/upload", upload.single("data"), (req, res) => {
    const file = req.file;
    fs.readFile(process.cwd() + "/public/img/" + file.filename, (err, data) => {
        //băm base64
        let fileName = `data:${file.mimetype};base64,${Buffer.from(data.toString('base64'))}`
        //khi có chuỗi băm hình thì xóa hình trong thư mục img
        fs.unlinkSync(process.cwd() + "/public/img/" + file.filename)
        // res.send(fileName);
        res.send({ message: "Upload thành công!", fileName })

    })
    // res.send({ message: "Upload thành công!", file })
})