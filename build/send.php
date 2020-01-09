<?php 
require_once 'PHPMailer/Exception.php';
require_once 'PHPMailer/PHPMailer.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;


//  ПОДГОТОВИТЕЛЬНЫЕ ДАННЫЕ
//  Массив получаемый от формы
$userData = filter_input_array(INPUT_POST, [
    'name' => FILTER_SANITIZE_STRING,
    'phone' => [
                    'filter' => FILTER_VALIDATE_REGEXP, 
                    'options' => [
                            'regexp' => '/^[0-9\s\(\)\+\-]{1,18}$/'//email /[0-9a-z_\-]+@[0-9a-z_^\.]+\.[a-z]{2,3}/i
                    ]
                ],
    'title' => FILTER_SANITIZE_STRING,
    'orderfk' => FILTER_SANITIZE_STRING,
    'array' => [
                    'filter' => FILTER_SANITIZE_STRING,
                    'flags'  => FILTER_REQUIRE_ARRAY,
                ]
]);
// Заголовки для сообщения (ключи совпадают с ключами массива $userData)
$titleData = [
    'name' => 'Имя',
    'phone' => 'Телефон',
    'title' => 'Заполнена форма',
    'array' => 'Какой-то заголовок',
];

if ( !empty($userData['orderfk']) ) die();

$response = [];     // Возвращаемый массив ответов по ajax - инициализируем
$message = '';      // html - сообщение для письма - инициализация
$responseError = [  // коды ответов для js 
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

     
/*  Проверяем правильность ввода phone */
if ( !$userData['phone'] ) {
    $response = $responseError[104];    //неправильный телефон
} else {

    /* Формируем сообщение */
    $message .= '<table>';
    foreach ($titleData as $key => $value) {

        if ( empty($userData[$key]) ) continue;

        $message .= '<tr>';
        $message .= '<td style="vertical-align: top;padding: 10px 20px 5px 0;border-bottom: 1px solid #ddd">'. $value . '</td>';
        $message .= '<td style="vertical-align: top;padding: 10px 20px 5px 0;border-bottom: 1px solid #ddd">';

        if (is_array($userData[$key])) {
            $message .= '- '. implode(';<br>- ', $userData[$key] );
        } else {
            $message .= $userData[$key];
        }
        
        $message .= '</td></tr>';
    }
    $message .= '</table>';
 

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