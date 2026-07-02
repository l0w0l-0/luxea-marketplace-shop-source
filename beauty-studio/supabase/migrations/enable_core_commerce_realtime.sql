DO $$
DECLARE
  table_name text;
  core_tables text[] := ARRAY[
    'products',
    'product_colors',
    'inventory',
    'carts',
    'cart_items',
    'orders',
    'order_items',
    'loyalty',
    'loyalty_transactions'
  ];
BEGIN
  FOREACH table_name IN ARRAY core_tables
  LOOP
    EXECUTE format(
      'ALTER TABLE public.%I REPLICA IDENTITY FULL',
      table_name
    );

    IF NOT EXISTS (
      SELECT 1
      FROM pg_publication_tables
      WHERE pubname = 'supabase_realtime'
        AND schemaname = 'public'
        AND tablename = table_name
    ) THEN
      EXECUTE format(
        'ALTER PUBLICATION supabase_realtime ADD TABLE public.%I',
        table_name
      );
    END IF;
  END LOOP;
END $$;
