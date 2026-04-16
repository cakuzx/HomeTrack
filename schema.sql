-- ==========================================
-- HomeTrack - Schema SQL
-- Ejecutar en: Supabase > SQL Editor
-- ==========================================

-- 1. Tabla de Productos
CREATE TABLE IF NOT EXISTS public.products (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name          text NOT NULL,
  category      text,
  unit          text,
  min_quantity  numeric DEFAULT 1,
  current_quantity numeric DEFAULT 0,
  status        text DEFAULT 'available' CHECK (status IN ('available', 'low', 'out_of_stock', 'to_buy')),
  notes         text,
  created_at    timestamptz DEFAULT now(),
  updated_at    timestamptz DEFAULT now()
);

-- 2. Tabla de Compras
CREATE TABLE IF NOT EXISTS public.purchases (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id    uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  user_id       uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  purchase_date date NOT NULL DEFAULT CURRENT_DATE,
  expiry_date   date,
  quantity      numeric NOT NULL,
  price         numeric NOT NULL,
  store         text,
  notes         text,
  created_at    timestamptz DEFAULT now()
);

-- 3. Tabla de Lista de Compras
CREATE TABLE IF NOT EXISTS public.shopping_list (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id    uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  user_id       uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  added_date    date DEFAULT CURRENT_DATE,
  priority      text DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low')),
  is_purchased  boolean DEFAULT false
);

-- ==========================================
-- ROW LEVEL SECURITY (RLS)
-- ==========================================

ALTER TABLE public.products     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchases    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shopping_list ENABLE ROW LEVEL SECURITY;

-- Políticas para PRODUCTS
CREATE POLICY "Users can view all products"
  ON public.products FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Users can insert products"
  ON public.products FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update any product"
  ON public.products FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "Users can delete any product"
  ON public.products FOR DELETE
  USING (auth.role() = 'authenticated');

-- Políticas para PURCHASES
CREATE POLICY "Users can view all purchases"
  ON public.purchases FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Users can insert purchases"
  ON public.purchases FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update any purchase"
  ON public.purchases FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "Users can delete any purchase"
  ON public.purchases FOR DELETE
  USING (auth.role() = 'authenticated');

-- Políticas para SHOPPING_LIST
CREATE POLICY "Users can view all shopping list"
  ON public.shopping_list FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Users can insert into shopping list"
  ON public.shopping_list FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update any shopping list item"
  ON public.shopping_list FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "Users can delete any shopping list item"
  ON public.shopping_list FOR DELETE
  USING (auth.role() = 'authenticated');

-- ==========================================
-- Trigger: actualizar updated_at en products
-- ==========================================
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();
