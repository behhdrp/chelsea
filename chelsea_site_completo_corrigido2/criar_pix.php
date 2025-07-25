<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

// Seu token de API
$token = '39415|IzeH9bCNKIORx0FkHGGBoFw3O7U0zngrLK05oueK1d7a26aa';

// Dados do Pix
$data = [
    "value" => 3800, // Valor em centavos (R$1,00)
    "description" => "Pagamento Chelsea Peneira"
];

$payload = json_encode($data);

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, "https://api.pushinpay.com.br/api/pix/cashIn");
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    "Authorization: Bearer $token",
    "Accept: application/json",
    "Content-Type: application/json"
]);

$response = curl_exec($ch);
$httpcode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curl_error = curl_error($ch);
curl_close($ch);

// DEBUG EXPLÍCITO
if ($curl_error) {
    echo json_encode([
        "erro" => "curl_error",
        "mensagem" => $curl_error
    ]);
    exit;
}

$result = json_decode($response, true);

if ($httpcode >= 400 || isset($result['error']) || isset($result['message'])) {
    echo json_encode([
        "erro" => "API_ERROR",
        "codigo_http" => $httpcode,
        "resposta" => $result
    ]);
    exit;
}

echo json_encode($result);
exit;
?>