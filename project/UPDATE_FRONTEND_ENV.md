# 🔄 Update Frontend Environment Variables

## New Backend URL
The backend has been successfully deployed to:
`https://nxs-e-jobcards-back-5dyhb85qp-cyber-guys-projects.vercel.app`

## Update Frontend Environment Variables

In your Vercel frontend project settings, update:

```
VITE_API_URL=https://nxs-e-jobcards-back-5dyhb85qp-cyber-guys-projects.vercel.app
VITE_ADMIN_API_KEY=your_secure_random_string
```

## Set Backend Environment Variables

In your Vercel backend project settings, add:

```
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
ADMIN_API_KEY=your_secure_random_string
```

## Test the New Backend

1. **Open the test page:** `test-new-backend.html`
2. **Click "Test API"** button
3. **Check the result** - should show 200 status if working

## Next Steps

1. ✅ Backend deployed successfully
2. ⏳ Set environment variables in Vercel
3. ⏳ Update frontend environment variables
4. ⏳ Test engineer creation in the app

Once environment variables are set, the engineer creation should work!

