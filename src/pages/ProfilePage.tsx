import { User as UserIcon, Mail, Calendar, Shield } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { useAuth } from "~/contexts/AuthContext";

export function ProfilePage() {
  const { user, isAnonymous, hasBackendConfigured } = useAuth();

  if (!user) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <UserIcon className="h-8 w-8" />
        <div>
          <h1 className="text-3xl font-bold">Profile</h1>
          <p className="text-muted-foreground">Your account information</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Profile Card */}
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>Your profile details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-4">
              {user.picture ? (
                <img
                  src={user.picture}
                  alt={user.name || "User"}
                  className="h-20 w-20 rounded-full border-2 border-border"
                />
              ) : (
                <div className="h-20 w-20 rounded-full bg-accent flex items-center justify-center">
                  <UserIcon className="h-10 w-10 text-muted-foreground" />
                </div>
              )}
              <div className="flex-1">
                <h3 className="text-xl font-semibold">{user.name || "User"}</h3>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Email</p>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
              </div>

              {user.id && (
                <div className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">User ID</p>
                    <p className="text-sm text-muted-foreground font-mono break-all">
                      {user.id}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Account Status Card */}
        <Card>
          <CardHeader>
            <CardTitle>Account Status</CardTitle>
            <CardDescription>Your account type and settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium mb-2">Account Type</p>
                {isAnonymous ? (
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                    Anonymous User
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    Google Account
                  </Badge>
                )}
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium mb-2">Storage Mode</p>
                {isAnonymous || !hasBackendConfigured ? (
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                    Local Storage (Offline)
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    Cloud Synced
                  </Badge>
                )}
              </div>
            </div>

            <div className="pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                {isAnonymous || !hasBackendConfigured
                  ? "Your data is stored locally on this device. To sync across devices, sign in with Google."
                  : "Your data is automatically synced with the cloud and accessible from any device."}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Information Card */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>About Your Data</CardTitle>
            <CardDescription>How we handle your information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Data Privacy</h4>
                <p className="text-sm text-muted-foreground">
                  Your diet and nutrition data is private and secure. We never share your
                  personal information with third parties.
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Data Portability</h4>
                <p className="text-sm text-muted-foreground">
                  You can export your data at any time from the Settings page. Your data
                  is yours to keep and use as you wish.
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Account Control</h4>
                <p className="text-sm text-muted-foreground">
                  You have full control over your account. You can sign out at any time
                  using the menu in the header.
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Data Backup</h4>
                <p className="text-sm text-muted-foreground">
                  {isAnonymous || !hasBackendConfigured
                    ? "We recommend regularly exporting your data from Settings to create backups."
                    : "Your data is automatically backed up in the cloud."}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
