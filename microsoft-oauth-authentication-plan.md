# Microsoft OAuth Authentication Architecture Plan
## Technical Service Operations (TSO4ALL)

### Overview
Implementation of Microsoft OAuth authentication with domain restriction to @auraminerals.com for corporate login access.

---

## 1. Supabase Authentication Configuration

### 1.1 Microsoft OAuth Setup in Supabase Dashboard

**Steps Required:**
1. Access Supabase Dashboard → Authentication → Providers
2. Enable Microsoft provider
3. Configure OAuth settings:
   - **Client ID**: Azure AD Application ID
   - **Client Secret**: Azure AD Application Secret
   - **Redirect URL**: `https://iphgikiztnttgtpkclkd.supabase.co/auth/v1/callback`
   - **Site URL**: `https://your-domain.com` (production URL)

### 1.2 Domain Restriction Configuration

**Domain Restriction Implementation:**
```sql
-- Create custom function for domain validation
CREATE OR REPLACE FUNCTION validate_auraminerals_domain()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if email domain is @auraminerals.com
  IF NEW.email LIKE '%@auraminerals.com' THEN
    RETURN NEW;
  ELSE
    RAISE EXCEPTION 'Only @auraminerals.com domain emails are allowed';
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for user creation
CREATE TRIGGER validate_domain_trigger
  BEFORE INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION validate_auraminerals_domain();
```

---

## 2. Microsoft Azure AD Configuration

### 2.1 Azure App Registration Requirements

**Required Permissions:**
- `User.Read` (Microsoft Graph)
- `openid` (OpenID Connect)
- `profile` (Profile access)
- `email` (Email access)

**Redirect URIs:**
- Development: `http://localhost:3000/auth/callback`
- Production: `https://your-domain.com/auth/callback`

### 2.2 Environment Variables Setup

```env
# Azure AD Configuration
AZURE_AD_CLIENT_ID=your-azure-app-client-id
AZURE_AD_CLIENT_SECRET=your-azure-app-client-secret
AZURE_AD_TENANT_ID=your-tenant-id

# Supabase Configuration (already exists)
NEXT_PUBLIC_SUPABASE_URL=https://iphgikiztnttgtpkclkd.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 3. Next.js Authentication Implementation

### 3.1 Authentication Service Layer

**File: `src/lib/auth/microsoft-auth.ts`**
```typescript
import { supabase } from '@/lib/supabase/client'

export interface MicrosoftUser {
  id: string
  email: string
  name: string
  given_name: string
  family_name: string
  tenantId: string
}

export class MicrosoftAuthService {
  static async signInWithMicrosoft() {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'azure',
      options: {
        scopes: 'email profile openid',
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    })
    
    if (error) throw error
    return data
  }

  static async signOut() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  static async getCurrentUser(): Promise<MicrosoftUser | null> {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user || !user.email?.endsWith('@auraminerals.com')) {
      return null
    }

    return {
      id: user.id,
      email: user.email,
      name: user.user_metadata?.full_name || user.email,
      given_name: user.user_metadata?.given_name || '',
      family_name: user.user_metadata?.family_name || '',
      tenantId: user.user_metadata?.tenant_id || '',
    }
  }

  static async checkDomainRestriction(email: string): Promise<boolean> {
    return email.endsWith('@auraminerals.com')
  }
}
```

---

## 4. Implementation Phases

### Phase 1: Infrastructure Setup
1. ✅ Configure Microsoft Azure AD App Registration
2. ✅ Configure Supabase Microsoft OAuth Provider
3. ✅ Set up domain restriction in Supabase
4. ✅ Create environment variables

### Phase 2: Core Authentication
1. ✅ Create authentication service layer
2. ✅ Implement authentication context
3. ✅ Create login components
4. ✅ Set up authentication pages

### Phase 3: Database Integration
1. ✅ Create user profiles table
2. ✅ Implement RLS policies
3. ✅ Set up profile creation triggers
4. ✅ Create user management functions

### Phase 4: UI Integration
1. ✅ Update sidebar to show user info
2. ✅ Add logout functionality
3. ✅ Implement protected routes
4. ✅ Add user profile management

---

## 5. Security Considerations

### 5.1 Domain Validation
- Server-side domain validation in database triggers
- Client-side validation for immediate feedback
- Rate limiting on authentication attempts

### 5.2 Session Management
- Secure token storage using Supabase Auth
- Automatic session refresh
- Proper logout cleanup

### 5.3 Error Handling
- Graceful handling of authentication failures
- Clear error messages for domain restrictions
- Fallback mechanisms for service outages

---

## Next Steps

This architecture provides a secure, scalable solution for Microsoft OAuth authentication with domain restrictions. The implementation ensures that only users with @auraminerals.com email addresses can access the TSO4ALL system while maintaining a professional corporate authentication experience.