request handler thì chỉ có 3 tham số là req, res, next
error handler thì 4 tham số req, res ,next , error

Nếu next mà truyền error vào là đang gọi error handler
ví dụ next(err)

khi mà next err ra mà ở dưới là request hanlder thì bỏ qua mà chạy thẳng vào error handler

--đối với async với sync trong next function sẽ khác nhau
--sync đồng bộ throw 1 lỗi ra thì nó sẽ như next
--async hay callback throw thì không

=> Tóm gọi lại là nếu lỗi trong hanlder thì express.js sẽ tự next cho chúng ta nhưng mà khi dùng async hay callback thì bắt try catch

// Giải thích đồng bộ và bất đồng bộ

1. Đồng bộ (Synchronous): Đợi kiểu "Xếp hàng cứng"
   Đúng như Châu nói, nó chạy từ trên xuống dưới.

Hành động A: Đang chạy (ví dụ: đọc file nặng).

Cả hệ thống: Đứng im, không làm gì cả, mọi yêu cầu khác phải đứng sau chờ A xong.

Hành động B: Chỉ bắt đầu khi A đã xong hoàn toàn.

Giống như: Một quán ăn chỉ có 1 đầu bếp và 1 cái bếp. Ông ấy đang chiên gà thì không thể nào nhận order hay xào rau được. Mọi người phải đợi ông ấy chiên xong gà mới được phục vụ tiếp.

2. Bất đồng bộ (Asynchronous) với await: Đợi kiểu "Linh hoạt"
   Chỗ này Châu cần chú ý: Khi gặp await ở hành động A, đúng là mã ở trong hàm đó sẽ dừng lại chờ A xong rồi mới gán giá trị và chạy tiếp hành động B. NHƯNG, cả cái server (Event Loop) thì KHÔNG dừng lại.

Hành động A (await): Đang chờ dữ liệu từ database trả về.

Trong lúc chờ: Server sẽ tranh thủ đi xử lý yêu cầu của một người dùng khác (User C).

Khi A xong: Server quay lại "gán giá trị" và chạy tiếp hành động B của Châu.
