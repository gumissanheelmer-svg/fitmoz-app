---
name: Admin Panel
description: Super admin panel with dashboard, user/community management, reports, and logs
type: feature
---
- Routes under /admin/* protected by AdminRoute checking has_role(uid, 'admin')
- Sidebar layout with: Dashboard, Usuários, Comunidade, Denúncias, Logs, Configurações
- User statuses: pendente, ativo, teste, expirado, rejeitado
- Reports table for post denúncias with status: pendente, resolvido, ignorado
- Admin logs table tracks all admin actions
- To make a user admin: INSERT INTO user_roles (user_id, role) VALUES ('uuid', 'admin')
