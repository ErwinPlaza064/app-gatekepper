<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Visitor;
use App\Models\User;
use App\Events\VisitorStatusUpdated;
use App\Notifications\AdminVisitorStatusNotification;

class TestRealtimeNotifications extends Command
{
    protected $signature = 'test:realtime-notifications';
    protected $description = 'Test realtime notifications for admin panel';

    public function handle()
    {
        $this->info('🧪 Testing realtime notifications...');

        // Buscar admin y visitor
        $admin = User::where('rol', 'administrador')->first();
        $visitor = Visitor::latest()->first();

        if (!$admin) {
            $this->error('❌ No admin user found');
            return 1;
        }

        if (!$visitor) {
            $this->error('❌ No visitor found');
            return 1;
        }

        $this->info("✅ Admin: {$admin->name}");
        $this->info("✅ Visitor: {$visitor->name}");

        // Test 1: Direct broadcast
        $this->info('📡 Testing direct broadcast...');
        broadcast(new VisitorStatusUpdated($visitor, 'approved', $visitor->user));
        $this->info('✅ Direct broadcast sent');

        // Test 2: Complete notification flow
        $this->info('🔔 Testing complete notification flow...');
        $notification = new AdminVisitorStatusNotification($visitor, 'approved', $visitor->user);
        $notification->sendFilamentNotification($admin);
        $this->info('✅ Complete notification sent');

        $this->info('🎯 Check your admin panel at /admin for real-time notifications!');
        $this->info('📱 Open browser console to see Pusher events');

        return 0;
    }
}
