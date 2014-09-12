# โปรแกรม Audit
ใช้สำหรับตรวจสอบข้อมูล OP/PP จาก 43 แฟ้ม

# คำเตือนการนำไปใช้งาน

ของดการให้คำแนะนำในการเขียนและการใช้งาน ไม่ว่ากรณีใดๆ ทั้งสิ้น (อยากให้ศึกษาและแก้ปัญหาเองครับ) <3

# Software requirements
* NodeJS
* Node-Webkit
* MySQL

# Installation
1. ติดตั้ง NodeJS และ Git [ดูวีดีโอ](http://www.youtube.com/watch?v=tlntE8fe6u4)
2. ติดตั้ง Node-WebKit ดาวน์โหลดจาก [Node-WebKit](https://github.com/rogerwang/node-webkit) แล้วทำการ set path ให้สามารถใช้คำสั่ง nw ได้
3. ติดตั้ง MySQL

# Download โปรแกรม
ใช้ Git โดยทำการ Clone โดยใช้คำสั่ง ดังนี้

```
git clone https://github.com/siteslave/audit_oppp.git
cd audit_oppp
sudo npm install
bower install
```

# รันโปรแกรม

```
nw .
```
# กำหนดค่า

เมื่อเข้าใช้งานเสร็จแล้วให้ทำการกำหนดค่าการเชื่อมต่อฐานข้อมูล โดยเข้าไปที่เมนู `กำหนดค่าการใช้งาน`

# License

MIT