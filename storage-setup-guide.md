# 📦 Supabase Storage Bucket Setup Guide

## Manual Bucket Creation Steps

### 1. Navigate to Storage
- Go to your **Supabase Dashboard**
- Click **"Storage"** in the left sidebar
- You'll see the Storage management interface

### 2. Create New Bucket
- Click the **"Create a new bucket"** button
- A dialog will appear

### 3. Configure Bucket Settings
- **Bucket name**: `excellence-files` (exactly this name)
- **Public bucket**: ✅ **Toggle ON** (make it public)
- **File size limit**: Leave default or set as needed

### 4. Create Bucket
- Click **"Create bucket"**
- Wait for confirmation

### 5. Verify Creation
- You should see "excellence-files" in your bucket list
- It should show as "Public" status

### 6. Test Access
- Try uploading a test file through your app
- Check if files appear in the bucket

## Alternative: SQL Command Method

If you prefer command line, run this in SQL Editor:

```sql
-- Create bucket manually
INSERT INTO storage.buckets (id, name, public)
VALUES ('excellence-files', 'excellence-files', true)
ON CONFLICT (id) DO NOTHING;

-- Verify bucket exists
SELECT * FROM storage.buckets WHERE name = 'excellence-files';
```

## Troubleshooting

### Bucket Not Appearing?
- Refresh the Supabase Dashboard
- Check if you have proper permissions
- Verify the name is exactly `excellence-files`

### Access Denied Errors?
- Ensure bucket is set to "Public"
- Check RLS policies in the SQL schema
- Verify your Supabase project settings

### Still Having Issues?
1. Delete any existing "excellence-files" bucket
2. Recreate using the manual steps above
3. Run the complete `supabase-schema-no-auth.sql` script again

## Verification Checklist

After creating the bucket:
- [ ] Bucket name: `excellence-files`
- [ ] Status: Public
- [ ] Can see it in Storage dashboard
- [ ] Test upload works in your app
- [ ] Diagnostic shows "Storage bucket exists"

Your file upload system should work perfectly after this setup!