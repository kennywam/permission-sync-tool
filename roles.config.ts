export const roles = [
  {
    name: 'Admin',
    permissions: [
      { action: 'manage', subject: 'all' },
    ],
  },
  {
    name: 'User',
    permissions: [
      { action: 'read', subject: 'Project' },
    ],
  },
];
