<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");

$storageFolder = '../storage/tracking';
if (!is_dir($storageFolder)) {
    echo json_encode([]);
    exit;
}

$files = scandir($storageFolder);
$logs = [];

// Group files by timestamp (assuming naming convention snap_[timestamp].png and log_[timestamp].txt)
foreach ($files as $file) {
    if ($file === '.' || $file === '..') continue;

    // Extract timestamp from filename
    if (preg_match('/_(?P<ts>\d+)\./', $file, $matches)) {
        $ts = $matches['ts'];
        if (!isset($logs[$ts])) {
            $logs[$ts] = [
                'id' => $ts,
                'timestamp_raw' => (int)$ts,
                'timestamp' => date("Y-m-d H:i:s", (int)$ts),
                'photo' => null,
                'lat' => null,
                'lng' => null,
                'accuracy' => null,
            ];
        }

        if (strpos($file, 'snap_') === 0) {
            // Path relative to the web root for frontend access
            $logs[$ts]['photo'] = 'api/' . $storageFolder . '/' . $file;
            // Simplify: the frontend will access via ./storage/tracking/snap_...
            // the PHP script is in public/api/
            // public/api/../storage/tracking/snap_... -> public/storage/tracking/snap_...
            $logs[$ts]['photo'] = 'storage/tracking/' . $file;
        } elseif (strpos($file, 'log_') === 0) {
            $content = file_get_contents($storageFolder . '/' . $file);
            if (preg_match('/Latitude: (?P<lat>[\d.-]+)/', $content, $latMatch)) {
                $logs[$ts]['lat'] = (float)$latMatch['lat'];
            }
            if (preg_match('/Longitude: (?P<lng>[\d.-]+)/', $content, $lngMatch)) {
                $logs[$ts]['lng'] = (float)$lngMatch['lng'];
            }
            if (preg_match('/Accuracy: (?P<acc>[\d.-]+)/', $content, $accMatch)) {
                $logs[$ts]['accuracy'] = (float)$accMatch['acc'];
            }
        }
    }
}

// Convert associative array to indexed array and sort by latest first
$output = array_values($logs);
usort($output, function($a, $b) {
    return $b['timestamp_raw'] - $a['timestamp_raw'];
});

echo json_encode($output);
?>
