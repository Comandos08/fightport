

# Fix email update feedback message

## Problem
The current `emailConfirmSent` translation is vague — it doesn't mention that the current email stays active or show which email the link was sent to.

## Changes

### 1. Update i18n translations (3 files)
Replace the `emailConfirmSent` value in each locale to include the `{{email}}` interpolation and clarify that the current email remains active:

- **pt-BR**: `"Enviamos um link de confirmação para {{email}}. Clique no link para confirmar a troca. Seu e-mail atual permanece ativo até a confirmação."`
- **en**: `"We sent a confirmation link to {{email}}. Click the link to confirm the change. Your current email remains active until confirmation."`
- **es**: `"Enviamos un enlace de confirmación a {{email}}. Haz clic en el enlace para confirmar el cambio. Tu correo actual sigue activo hasta la confirmación."`

### 2. Update toast call in Configuracoes.tsx (line 37)
Change `toast.success(t('settings.emailConfirmSent'))` to `toast.success(t('settings.emailConfirmSent', { email: newEmail }))` — pass the new email **before** clearing `newEmail`.

No other behavior, validation, or tabs are touched.

