# Routing (React Router v7)

```tsx
import { Outlet, Route, Routes } from 'react-router';

export const AppRoutes = () => {
  return (
    <Routes>
      <Route
        element={
          <RootLayout>
            <Outlet />
          </RootLayout>
        }
      >
        <Route
          element={
            <Layout>
              <Outlet />
            </Layout>
          }
        >
          <Route path='/' element={<HomePage />} />
          <Route path='/users' element={<UsersPage />} />
          <Route path='/users/:id' element={<UserDetailPage />} />
        </Route>
      </Route>
    </Routes>
  );
};
```
