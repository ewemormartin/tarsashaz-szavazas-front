import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // Megpróbáljuk kiolvasni a tokent a böngésző tárolójából
  const token = localStorage.getItem('token');

  // Ha van token, lemásoljuk a kérést és hozzáadjuk az Authorization fejlécet
  if (token) {
    const cloned = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    return next(cloned);
  }

  // Ha nincs token, változatlanul küldjük tovább a kérést
  return next(req);
};