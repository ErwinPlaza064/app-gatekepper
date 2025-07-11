<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class QrController extends Controller
{
    public function upload(Request $request)
    {
        $data = $request->input('image');
        if (!$data) {
            return response()->json(['error' => 'No image provided'], 400);
        }

        $image = base64_decode($data);
        $filename = 'qr-codes/' . uniqid() . '.png';
        Storage::disk('public')->put($filename, $image);

        $url = Storage::url($filename);
        return response()->json(['url' => asset('storage/' . $filename)]);
    }
}
