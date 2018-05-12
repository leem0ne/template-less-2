<?php 

use PHPMailer\PHPMailer\PHPMailer;
//use PHPMailer\PHPMailer\Exception;

//require 'PHPMailer/Exception.php';
require 'PHPMailer/PHPMailer.php';

$userData = filter_input_array(INPUT_POST, [
    'name' => FILTER_SANITIZE_STRING,
    'phone' => [
                    'filter' => FILTER_VALIDATE_REGEXP, 
                    'options' => [
                            'regexp' => '/^[0-9\s\(\)\+\-]{1,18}$/'
                    ]
                ],
    'title' => FILTER_SANITIZE_STRING,
    'email' => FILTER_SANITIZE_STRING,
]);
    
$response = [];
$responseError = [
    100 => [
        'code' => 100,
        'text' => 'сообщение отправлено'
    ],
    101 => [
        'code' => 101,
        'text' => 'сообщение не отправлено'
    ],
    102 => [
        'code' => 102,
        'text' => 'заполнены не все поля'
    ],
    103 => [
        'code' => 103,
        'text' => 'неправильный email'
    ],
    104 => [
        'code' => 104,
        'text' => 'неправильный номер телефона'
    ],
];

     
/*  Проверяем правильность ввода email */
if ( !$userData['phone'] ) {
    $response = $responseError[104];    //неправильный телефон
} else {

    /* Формируем сообщение */
    $message = "<p>Имя: ".$userData['name']."<br>Телефон: ".$userData['phone']."<br>Email: ".$userData['email']."</p><p>Заполнена форма: ".$userData['title']."</p>";
 

    $mail = new PHPMailer;

    $mail->setFrom('info@leem-one.ru', '');
    $mail->addAddress('irbisant@mail.ru');

    $mail->isHTML(true);
    $mail->CharSet = "utf-8";
    $mail->Port = 587;
    $mail->SMTPSecure = 'tls';

    $mail->Subject = "Заявка с сайта";
    $mail->Body = $message;

    if(file_exists($_FILES['fileupload']['tmp_name'])){
        $mail->AddAttachment($_FILES['fileupload']['tmp_name'], $_FILES['fileupload']['name']);
    }

    /* Отправка сообщения */         
    if  ( $mail->send() ){
        $response = $responseError[100];  //сообщение отправлено
    }else{
        $error[] = $mail->ErrorInfo;
        $response = $responseError[101];     //сообщение не отправлено
    };
}

echo json_encode($response);