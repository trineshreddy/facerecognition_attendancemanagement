require('dotenv').config();
const express=require('express')
const bodyParser=require("body-parser")
const ejs = require("ejs");
const mysql = require('mysql');
const fileUpload = require('express-fileupload');
const fs =require('fs')
const app=express()
app.use(fileUpload());
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: process.env.mysqlpassword,
  database: 'college'
});
db.connect((err) => {
  if (err) throw err;
  console.log('Connected to mysql!');
});


app.get('/',(req,res)=>{
  res.render("home")
})

app.get('/teacher-signin',(req,res)=>{
  res.render("teacher-signin");

})
app.get('/teacher-signup',(req,res)=>{
  res.render("teacher-signup");

})
app.get('/student-signin',(req,res)=>{
  res.render("student-signin");

})
app.get('/student-signup',(req,res)=>{
  res.render("student-signup");

})
app.get('/photo',(req,res)=>{
  res.render("photo");

})
//pcv

app.get("/courses/:pcourse",(req,res)=>{
   let coursename=req.params.pcourse;
  let query1=`select student_id from studentcourses where course_id=(select id from courses where coursename='${coursename}')`;



    db.query(query1,(err,rows)=>{
      if(err) throw err;
      console.log("we are here")
      console.log(rows);
        console.log("we are not here")


      res.render("pcv",{rows:rows,coursename:coursename});

    })



})
//show attendance for student

app.get("/student/:pcourse/:sname",(req,res)=>{
  let coursename=req.params.pcourse;
  let studentname=req.params.sname;
  let query=`select id from courses where coursename='${coursename}'`;
  db.query(query,(err,rows)=>{
    if(err) throw err;

    let id=rows[0].id;

    let query2="select * from " +id+"_attendance where student_name="+"'" +studentname + "'";
    db.query(query2,(err,rows2)=>{
      if(err) throw err;
      console.log(rows2);
      res.render("studentav",{rows2:rows2})
    })
})
})

//show attendance for teacher

app.get("/attendance/:pcourse",(req,res)=>{
  let coursename=req.params.pcourse;
  let query=`select id from courses where coursename='${coursename}'`;
  let s="";


  db.query(query,(err,rows)=>{
    if(err) throw err;
    console.log(rows);
    let id=rows[0].id;
    console.log("the id is"+id)
    console.log("select * from " +id+"_attendance")
    let query2="select * from " +id+"_attendance";
    db.query(query2,(err,rows2)=>{
      if(err) throw err;
      console.log(rows2);

      for(var i in rows2){
   var key = i;
   var val = rows2[i];
   for(var j in val){
       var sub_key = j;
       var sub_val = val[j];
       console.log(sub_val);
   }
   console.log("end")
}



       res.render("showattendance",{rows2:rows2})

    })


  })


})

//take _attendance

app.get('/takeattendance/:pcourse',(req,res)=>{
   let coursename=req.params.pcourse;

    let query=`select name,id from student where id in(select student_id from studentcourses where course_id=(select id from courses where coursename='${coursename}'))`;
  db.query(query,(err,rows)=>{
    if(err) throw err;
    console.log(rows);
     res.render("takeattendance",{rows:rows,coursename:coursename});
  })
})

//update _attendance

app.post('/updateattendance/:pcourse',(req,res)=>{
   let coursename=req.params.pcourse;
   console.log("the namderjfn" + coursename)
   console.log(req.body);
 console.log("ejfn")
 let input=req.body;


  let c=new Date();
  let day;

  switch (c.getMonth()) {
    case 0:
      day = "jan";
      break;
    case 1:
      day = "feb";
      break;
    case 2:
       day = "mar";
      break;
    case 3:
      day = "april";
      break;
    case 4:
      day = "may";
      break;
    case 5:
      day = "june";
      break;
    case 6:
      day = "july";
      case 7:
        day = "aug";
        break;
        case 8:
          day = "sep";
          break;
          case 9:
            day = "oct";
            break;
            case 10:
              day = "nov";
              break;
              case 11:
                day = "dec";



  }

  let cname=c.getDate()+day +c.getFullYear();
  console.log(cname);

  let query=`select id from courses where coursename='${coursename}'`;
  db.query(query,(err,rows)=>{
    if(err) throw err;
    let id=rows[0].id;
    let tablename=id+"_attendance";

     let query1 = `alter table ${tablename} add ${cname} varchar(1) default 'a'`;
      db.query(query1,(err,rows1)=>{
        if(err) throw err;
        console.log(rows1);
  let s="";
        for (const key of Object.keys(input)) {
          console.log("bkbdjrndjknd")

             for(let i=1;i<key.length-1;i++)
              s+=key[i];
              console.log(s);
          let query4=`update ${tablename} set ${cname}='p' where student_name= '${s}'`;
          console.log(key)
          console.log(query4);
          db.query(query4,(err,rows2)=>{
            if(err) throw err;

          })
          s="";
        }
      })




  })

})


//view student
app.get('/student-view',(req,res)=>{

  let name=req.query.student_name;
  let id=req.query.student_id;
  let password=req.query.student_password;
  let query1=`select password from student where  id='${id}' and name='${name}'`;



 db.query(query1,(err,rows)=>{
   if(err) throw err;
   console.log(rows);
   console.log(rows[0].password)
   if(rows[0].password!==password)
   return res.render("failure");

 })

  let query=`SELECT coursename FROM courses where id IN (select course_id from studentcourses where student_id=(select id from student where name='${name}'))`;
  db.query(query, (err,rows) => {
    if(err) throw err;

    console.log('Data received from Db:');
    res.render("student-view",{rows:rows,studentname:name})

});
})


//view teacher
app.get('/teacher-view',(req,res)=>{
    let name=req.query.teacher_name;
    let id=req.query.teacher_id;
    let password=req.query.teacher_password;
    let query1=`select password from teacher where  id='${id}' and name='${name}'`;



   db.query(query1,(err,rows)=>{
     if(err) throw err;
     console.log(rows);
     console.log(rows[0].password)
     if(rows[0].password!==password)
     return res.render("failure");

   })

  let query=`SELECT coursename FROM courses where teacherid = (select id from teacher where name='${name}')`;
  db.query(query, (err,rows) => {
    if(err) throw err;

    console.log('Data received from Db:');
    console.log(rows);
    console.log(rows[0].coursename);
    res.render("teacher-view",{teachername:name,rows:rows})

});

})



//mycoursesteacherview
app.get('/mycoursesteacherview',(req,res)=>{
  console.log("our query is")
  console.log(req.query);
  console.log("response is")
  let name=req.query.teachername;
  console.log("edbekjdbekj"+name);
  let my=name.toString();



    db.query(`select id from teacher where name='${name}'`, (err,rows) => {
      if(err) throw err;

      console.log('Data received from Db:');
      console.log("ejdejkddd")
      console.log(rows);

      res.render("mycoursesteacherview",{rows:rows})

  })

})


//view add courses form
app.get('/addcourse',(req,res)=>{
  res.render("addcourse");

})
//view astc form
app.get('/astc',(req,res)=>{
  res.render("astc");

})

//create new student

app.post('/student-signup',(req,res)=>{

  let new_student={id:req.body.student_id,name:req.body.student_name,mail:req.body.student_email,password:req.body.student_pass,gender:req.body.gender,phonenumber:req.body.student_ph};
  db.query('insert into student set ?',new_student,(err,result)=>{
    if(err) throw err;
    console.log(req.body);
    console.log("we got updated"+   result);
  });
///uploading files
  let sampleFile;
 let uploadPath;
  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).send('No files were uploaded.');
  }
 // console.log('req.files >>>', req.files); // eslint-disable-line
  // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
   sampleFile = req.files.sampleFile;
  let dirpath=__dirname+'/public/uploads/'+req.body.student_id;
  uploadPath = dirpath + '/'+sampleFile.name;

  try{
    fs.mkdirSync(dirpath);
    console.log("directory created")
  }
  catch(err){
    console.log(err);
  }

  // Use the mv() method to place the file somewhere on your server
  sampleFile.mv(uploadPath, function(err) {
    if (err)
      {return res.status(500).send(err);}

    res.send('File uploaded!');
  });
})



//create new teacher

app.post('/teacher-signup',(req,res)=>{

  let new_teacher={id:req.body.teacher_id,name:req.body.teacher_name,mail:req.body.teacher_email,password:req.body.teacher_password,gender:req.body.gender,phonenumber:req.body.teacher_ph};
  db.query('insert into teacher set ?',new_teacher,(err,result)=>{
    if(err) throw err;
    console.log("we got updated"+   result);
  });
})



//create courses
app.post('/addcourse',(req,res)=>{

  let new_course={id:req.body.course_id,coursename:req.body.course_name,credits:req.body.credits,teacherid:req.body.teacher_id};
  db.query('insert into courses set ?',new_course,(err,result)=>{
    if(err) throw err;
    console.log("we got updated"+   result);
  });
})




//add  student to course

app.post('/astc',(req,res)=>{
  let p=req.body;

  let astc={course_id:p.course_id,student_id:p.student_id};
  db.query('insert into studentcourses set ?',astc,(err,result)=>{
    if(err) throw err;
    console.log("we got updated"+   result);
  });
})



















app.listen(3000,()=>{console.log('server started at port 3000')});
