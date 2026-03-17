--
-- PostgreSQL database dump
--

\restrict b9A0LYRCDmfXwAyQpVc25Sig3QzXS9eMwnrokVoCbZWtoJhujNwf8LGqgAuxqQE

-- Dumped from database version 18.0
-- Dumped by pg_dump version 18.0

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: order_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.order_status AS ENUM (
    'CREATED',
    'PAID',
    'CONSUMED'
);


ALTER TYPE public.order_status OWNER TO postgres;

--
-- Name: payment_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.payment_status AS ENUM (
    'PENDING',
    'SUCCESS',
    'FAILED'
);


ALTER TYPE public.payment_status OWNER TO postgres;

--
-- Name: user_role; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.user_role AS ENUM (
    'student',
    'vendor',
    'admin'
);


ALTER TYPE public.user_role OWNER TO postgres;

--
-- Name: update_inventory_timestamp(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_inventory_timestamp() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
      BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
      END;
      $$;


ALTER FUNCTION public.update_inventory_timestamp() OWNER TO postgres;

--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_updated_at_column() OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: inventory; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.inventory (
    inventory_id integer NOT NULL,
    item_id integer NOT NULL,
    stock_quantity integer DEFAULT 0 NOT NULL,
    reserved_quantity integer DEFAULT 0 NOT NULL,
    available_quantity integer GENERATED ALWAYS AS ((stock_quantity - reserved_quantity)) STORED,
    low_stock_threshold integer DEFAULT 10,
    last_restocked_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_reserved_stock CHECK ((reserved_quantity <= stock_quantity)),
    CONSTRAINT inventory_reserved_quantity_check CHECK ((reserved_quantity >= 0)),
    CONSTRAINT inventory_stock_quantity_check CHECK ((stock_quantity >= 0))
);


ALTER TABLE public.inventory OWNER TO postgres;

--
-- Name: TABLE inventory; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.inventory IS 'Tracks stock levels and reservations for items';


--
-- Name: COLUMN inventory.stock_quantity; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.inventory.stock_quantity IS 'Total physical stock available';


--
-- Name: COLUMN inventory.reserved_quantity; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.inventory.reserved_quantity IS 'Stock reserved for pending orders';


--
-- Name: COLUMN inventory.available_quantity; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.inventory.available_quantity IS 'Computed: stock_quantity - reserved_quantity';


--
-- Name: inventory_inventory_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.inventory_inventory_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.inventory_inventory_id_seq OWNER TO postgres;

--
-- Name: inventory_inventory_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.inventory_inventory_id_seq OWNED BY public.inventory.inventory_id;


--
-- Name: items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.items (
    item_id integer NOT NULL,
    name character varying(100) NOT NULL,
    description text,
    price numeric(10,2) NOT NULL,
    stock_quantity integer DEFAULT 0 NOT NULL,
    category character varying(50),
    is_available boolean DEFAULT true,
    image_url character varying(255),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT items_price_check CHECK ((price >= (0)::numeric)),
    CONSTRAINT items_stock_quantity_check CHECK ((stock_quantity >= 0))
);


ALTER TABLE public.items OWNER TO postgres;

--
-- Name: TABLE items; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.items IS 'Stores food items available in the canteen';


--
-- Name: items_item_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.items_item_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.items_item_id_seq OWNER TO postgres;

--
-- Name: items_item_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.items_item_id_seq OWNED BY public.items.item_id;


--
-- Name: order_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.order_items (
    order_item_id integer NOT NULL,
    order_id integer NOT NULL,
    item_id integer NOT NULL,
    quantity integer NOT NULL,
    price_at_order numeric(10,2) NOT NULL,
    subtotal numeric(10,2) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT order_items_price_at_order_check CHECK ((price_at_order >= (0)::numeric)),
    CONSTRAINT order_items_quantity_check CHECK ((quantity > 0)),
    CONSTRAINT order_items_subtotal_check CHECK ((subtotal >= (0)::numeric))
);


ALTER TABLE public.order_items OWNER TO postgres;

--
-- Name: TABLE order_items; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.order_items IS 'Junction table linking orders to items with quantities';


--
-- Name: COLUMN order_items.price_at_order; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.order_items.price_at_order IS 'Price snapshot at order time - for historical accuracy';


--
-- Name: order_items_order_item_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.order_items_order_item_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.order_items_order_item_id_seq OWNER TO postgres;

--
-- Name: order_items_order_item_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.order_items_order_item_id_seq OWNED BY public.order_items.order_item_id;


--
-- Name: orders; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.orders (
    order_id integer NOT NULL,
    user_id integer NOT NULL,
    total_amount numeric(10,2) NOT NULL,
    status public.order_status DEFAULT 'CREATED'::public.order_status NOT NULL,
    qr_code_data text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    consumed_at timestamp without time zone,
    CONSTRAINT chk_consumed_time CHECK ((((status = 'CONSUMED'::public.order_status) AND (consumed_at IS NOT NULL)) OR ((status <> 'CONSUMED'::public.order_status) AND (consumed_at IS NULL)))),
    CONSTRAINT orders_total_amount_check CHECK ((total_amount >= (0)::numeric))
);


ALTER TABLE public.orders OWNER TO postgres;

--
-- Name: TABLE orders; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.orders IS 'Stores order information with status tracking';


--
-- Name: COLUMN orders.status; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.orders.status IS 'Order lifecycle: CREATED → PAID → CONSUMED';


--
-- Name: orders_order_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.orders_order_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.orders_order_id_seq OWNER TO postgres;

--
-- Name: orders_order_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.orders_order_id_seq OWNED BY public.orders.order_id;


--
-- Name: payments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.payments (
    payment_id integer NOT NULL,
    order_id integer NOT NULL,
    payment_ref character varying(100) NOT NULL,
    amount numeric(10,2) NOT NULL,
    status public.payment_status DEFAULT 'PENDING'::public.payment_status NOT NULL,
    payment_method character varying(50) DEFAULT 'SIMULATED'::character varying,
    transaction_time timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT payments_amount_check CHECK ((amount >= (0)::numeric))
);


ALTER TABLE public.payments OWNER TO postgres;

--
-- Name: TABLE payments; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.payments IS 'Stores payment information with unique references';


--
-- Name: COLUMN payments.payment_ref; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.payments.payment_ref IS 'Unique payment reference - prevents duplicate usage';


--
-- Name: payments_payment_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.payments_payment_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.payments_payment_id_seq OWNER TO postgres;

--
-- Name: payments_payment_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.payments_payment_id_seq OWNED BY public.payments.payment_id;


--
-- Name: sessions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sessions (
    session_id integer NOT NULL,
    user_id integer NOT NULL,
    token character varying(500) NOT NULL,
    expires_at timestamp without time zone NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    ip_address character varying(45),
    user_agent text
);


ALTER TABLE public.sessions OWNER TO postgres;

--
-- Name: TABLE sessions; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.sessions IS 'User session management for authentication';


--
-- Name: sessions_session_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.sessions_session_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.sessions_session_id_seq OWNER TO postgres;

--
-- Name: sessions_session_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.sessions_session_id_seq OWNED BY public.sessions.session_id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    user_id integer NOT NULL,
    name character varying(100) NOT NULL,
    email character varying(100) NOT NULL,
    phone character varying(15),
    role public.user_role DEFAULT 'student'::public.user_role NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    username character varying(50),
    password_hash character varying(255),
    year character varying(20),
    branch character varying(100),
    is_active boolean DEFAULT true,
    last_login timestamp without time zone
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: TABLE users; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.users IS 'Stores student and vendor user information';


--
-- Name: student_order_history; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.student_order_history AS
 SELECT o.order_id,
    o.user_id,
    u.name AS student_name,
    u.email,
    o.total_amount,
    o.status,
    o.created_at,
    o.consumed_at,
    p.payment_ref,
    p.status AS payment_status,
    count(oi.order_item_id) AS item_count
   FROM (((public.orders o
     JOIN public.users u ON ((o.user_id = u.user_id)))
     LEFT JOIN public.payments p ON ((o.order_id = p.order_id)))
     LEFT JOIN public.order_items oi ON ((o.order_id = oi.order_id)))
  WHERE (u.role = 'student'::public.user_role)
  GROUP BY o.order_id, o.user_id, u.name, u.email, o.total_amount, o.status, o.created_at, o.consumed_at, p.payment_ref, p.status
  ORDER BY o.created_at DESC;


ALTER VIEW public.student_order_history OWNER TO postgres;

--
-- Name: VIEW student_order_history; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON VIEW public.student_order_history IS 'Student-specific order history view';


--
-- Name: users_user_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_user_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_user_id_seq OWNER TO postgres;

--
-- Name: users_user_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_user_id_seq OWNED BY public.users.user_id;


--
-- Name: vendor_activity; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.vendor_activity (
    activity_id integer NOT NULL,
    vendor_id integer NOT NULL,
    order_id integer NOT NULL,
    action character varying(50) NOT NULL,
    result character varying(20) NOT NULL,
    notes text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.vendor_activity OWNER TO postgres;

--
-- Name: TABLE vendor_activity; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.vendor_activity IS 'Track all vendor scanning and verification activities';


--
-- Name: vendor_activity_activity_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.vendor_activity_activity_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.vendor_activity_activity_id_seq OWNER TO postgres;

--
-- Name: vendor_activity_activity_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.vendor_activity_activity_id_seq OWNED BY public.vendor_activity.activity_id;


--
-- Name: inventory inventory_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inventory ALTER COLUMN inventory_id SET DEFAULT nextval('public.inventory_inventory_id_seq'::regclass);


--
-- Name: items item_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.items ALTER COLUMN item_id SET DEFAULT nextval('public.items_item_id_seq'::regclass);


--
-- Name: order_items order_item_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_items ALTER COLUMN order_item_id SET DEFAULT nextval('public.order_items_order_item_id_seq'::regclass);


--
-- Name: orders order_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders ALTER COLUMN order_id SET DEFAULT nextval('public.orders_order_id_seq'::regclass);


--
-- Name: payments payment_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments ALTER COLUMN payment_id SET DEFAULT nextval('public.payments_payment_id_seq'::regclass);


--
-- Name: sessions session_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sessions ALTER COLUMN session_id SET DEFAULT nextval('public.sessions_session_id_seq'::regclass);


--
-- Name: users user_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN user_id SET DEFAULT nextval('public.users_user_id_seq'::regclass);


--
-- Name: vendor_activity activity_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vendor_activity ALTER COLUMN activity_id SET DEFAULT nextval('public.vendor_activity_activity_id_seq'::regclass);


--
-- Data for Name: inventory; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.inventory (inventory_id, item_id, stock_quantity, reserved_quantity, low_stock_threshold, last_restocked_at, created_at, updated_at) FROM stdin;
1	3	100	0	10	\N	2026-03-11 23:52:38.927579	2026-03-11 23:52:38.927579
2	4	100	0	10	\N	2026-03-11 23:52:38.927579	2026-03-11 23:52:38.927579
3	6	100	0	10	\N	2026-03-11 23:52:38.927579	2026-03-11 23:52:38.927579
4	7	100	0	10	\N	2026-03-11 23:52:38.927579	2026-03-11 23:52:38.927579
5	8	100	0	10	\N	2026-03-11 23:52:38.927579	2026-03-11 23:52:38.927579
6	10	100	0	10	\N	2026-03-11 23:52:38.927579	2026-03-11 23:52:38.927579
7	11	100	0	10	\N	2026-03-11 23:52:38.927579	2026-03-11 23:52:38.927579
8	12	100	0	10	\N	2026-03-11 23:52:38.927579	2026-03-11 23:52:38.927579
9	13	100	0	10	\N	2026-03-11 23:52:38.927579	2026-03-11 23:52:38.927579
10	14	100	0	10	\N	2026-03-11 23:52:38.927579	2026-03-11 23:52:38.927579
11	15	100	0	10	\N	2026-03-11 23:52:38.927579	2026-03-11 23:52:38.927579
12	17	100	0	10	\N	2026-03-11 23:52:38.927579	2026-03-11 23:52:38.927579
13	18	100	0	10	\N	2026-03-11 23:52:38.927579	2026-03-11 23:52:38.927579
14	19	100	0	10	\N	2026-03-11 23:52:38.927579	2026-03-11 23:52:38.927579
15	16	100	0	10	\N	2026-03-11 23:52:38.927579	2026-03-11 23:52:38.927579
16	2	100	0	10	\N	2026-03-11 23:52:38.927579	2026-03-11 23:52:38.927579
17	9	100	0	10	\N	2026-03-11 23:52:38.927579	2026-03-11 23:52:38.927579
18	5	100	0	10	\N	2026-03-11 23:52:38.927579	2026-03-11 23:52:38.927579
19	1	100	0	10	\N	2026-03-11 23:52:38.927579	2026-03-11 23:52:38.927579
\.


--
-- Data for Name: items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.items (item_id, name, description, price, stock_quantity, category, is_available, image_url, created_at, updated_at) FROM stdin;
4	Spring Roll	Crispy vegetable spring rolls (2 pcs)	20.00	50	Snacks	t	\N	2026-03-04 10:17:33.146271	2026-03-04 10:17:33.146271
6	Tea	Hot masala tea	10.00	200	Beverages	t	\N	2026-03-04 10:17:33.146271	2026-03-04 10:17:33.146271
10	Mango Juice	Fresh mango juice	25.00	60	Beverages	t	\N	2026-03-04 10:17:33.146271	2026-03-04 10:17:33.146271
11	Veg Thali	Complete meal with rice, roti, dal, sabzi	60.00	50	Main Course	t	\N	2026-03-04 10:17:33.146271	2026-03-04 10:17:33.146271
14	Dosa	Crispy rice crepe with sambar and chutney	40.00	60	Main Course	t	\N	2026-03-04 10:17:33.146271	2026-03-04 10:17:33.146271
18	Jalebi	Sweet crispy spirals (100g)	30.00	50	Desserts	t	\N	2026-03-04 10:17:33.146271	2026-03-04 10:17:33.146271
19	Rasgulla	Soft cottage cheese balls in syrup (2 pcs)	25.00	60	Desserts	t	\N	2026-03-04 10:17:33.146271	2026-03-04 10:17:33.146271
2	Vada Pav	Mumbai style potato fritter in a bun	15.00	79	Snacks	t	\N	2026-03-04 10:17:33.146271	2026-03-06 19:42:49.68653
5	Paneer Pakora	Fried cottage cheese fritters	25.00	39	Snacks	t	\N	2026-03-04 10:17:33.146271	2026-03-11 23:31:07.75309
1	Samosa	Crispy fried pastry with spiced potato filling	10.00	98	Snacks	t	\N	2026-03-04 10:17:33.146271	2026-03-11 23:31:07.75309
7	Coffee	Hot filter coffee	15.00	149	Beverages	t	\N	2026-03-04 10:17:33.146271	2026-03-16 22:42:14.419573
3	Bread Pakora	Deep fried bread with potato stuffing	12.00	60	Snacks	t	\N	2026-03-04 10:17:33.146271	2026-03-16 22:43:18.078121
15	Idli Sambar	Steamed rice cakes with sambar (3 pcs)	35.00	70	Breakfast	f	\N	2026-03-04 10:17:33.146271	2026-03-16 22:44:30.117938
16	Gulab Jamun	Sweet milk solid balls in sugar syrup (2 pcs)	20.00	78	Desserts	f	\N	2026-03-04 10:17:33.146271	2026-03-16 22:44:50.310272
17	Ice Cream	Vanilla ice cream cup	25.00	100	Desserts	f	\N	2026-03-04 10:17:33.146271	2026-03-16 22:44:54.132115
8	Cold Coffee	Chilled coffee with ice cream	30.00	78	Beverages	t	\N	2026-03-04 10:17:33.146271	2026-03-16 22:48:28.119469
9	Lemon Soda	Fresh lemon soda	20.00	97	Beverages	t	\N	2026-03-04 10:17:33.146271	2026-03-16 22:49:10.158447
13	Chole Bhature	Spicy chickpeas with fried bread	50.00	45	Main Course	t	\N	2026-03-04 10:17:33.146271	2026-03-16 23:03:06.837595
12	Paneer Butter Masala	Cottage cheese in rich tomato gravy with 2 rotis	80.00	40	Main Course	t	\N	2026-03-04 10:17:33.146271	2026-03-16 23:03:21.80878
\.


--
-- Data for Name: order_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.order_items (order_item_id, order_id, item_id, quantity, price_at_order, subtotal, created_at) FROM stdin;
16	8	7	1	15.00	15.00	2026-03-11 23:56:16.274026
17	9	8	1	30.00	30.00	2026-03-11 23:57:41.990768
18	10	9	1	20.00	20.00	2026-03-16 22:23:29.3383
19	10	16	1	20.00	20.00	2026-03-16 22:23:29.3383
20	11	8	1	30.00	30.00	2026-03-16 22:48:28.119469
21	12	9	1	20.00	20.00	2026-03-16 22:49:10.158447
\.


--
-- Data for Name: orders; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.orders (order_id, user_id, total_amount, status, qr_code_data, created_at, updated_at, consumed_at) FROM stdin;
9	7	30.00	CONSUMED	data:image/png;base64,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	2026-03-11 23:57:41.990768	2026-03-16 23:21:30.246737	2026-03-16 23:21:30.246737
10	7	40.00	CONSUMED	data:image/png;base64,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	2026-03-16 22:23:29.3383	2026-03-16 23:16:27.014171	2026-03-16 23:16:27.014171
12	7	20.00	CONSUMED	data:image/png;base64,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	2026-03-16 22:49:10.158447	2026-03-16 23:10:17.363421	2026-03-16 22:50:22.739376
11	7	30.00	CONSUMED	data:image/png;base64,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	2026-03-16 22:48:28.119469	2026-03-16 23:14:21.253986	2026-03-16 23:14:21.253986
8	7	15.00	CONSUMED	data:image/png;base64,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	2026-03-11 23:56:16.274026	2026-03-16 23:20:46.28274	2026-03-16 23:20:46.28274
\.


--
-- Data for Name: payments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.payments (payment_id, order_id, payment_ref, amount, status, payment_method, transaction_time, created_at) FROM stdin;
7	8	PAY-1773253576340-NJAEJH	15.00	SUCCESS	SIMULATED	2026-03-11 23:56:16.351126	2026-03-11 23:56:16.342511
8	9	PAY-1773253662064-8DL7ZG	30.00	SUCCESS	SIMULATED	2026-03-11 23:57:42.074207	2026-03-11 23:57:42.066844
9	10	PAY-1773680009388-PPOD5G	40.00	SUCCESS	SIMULATED	2026-03-16 22:23:29.396729	2026-03-16 22:23:29.389646
10	11	PAY-1773681508224-11DDZ0	30.00	SUCCESS	SIMULATED	2026-03-16 22:48:28.235416	2026-03-16 22:48:28.226094
11	12	PAY-1773681550205-TLJ666	20.00	SUCCESS	SIMULATED	2026-03-16 22:49:10.211789	2026-03-16 22:49:10.206316
\.


--
-- Data for Name: sessions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.sessions (session_id, user_id, token, expires_at, created_at, ip_address, user_agent) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (user_id, name, email, phone, role, created_at, updated_at, username, password_hash, year, branch, is_active, last_login) FROM stdin;
8	G.Srishanth Reddy	srishanthreddy@gmail.com	9059955790	vendor	2026-03-16 22:41:09.239939	2026-03-16 23:13:25.984855	srishanth	$2a$10$bD7EoihpKcZbqO17..lnquRqkPole8SxQoScUmVR3/z9VH/qDAhLa	\N	\N	t	2026-03-16 23:13:25.984855
7	Ajay Kumar Artham	arthamajay1@gmail.com	8555864922	student	2026-03-11 23:55:56.259566	2026-03-16 23:15:12.549004	arthamajay7	$2a$10$Ad0sFMY1m4B8ipb1zpco8.RKFOAD/1..f./iW0zV62GAI21t7mGwC	3rd Year	Computer Science Engineering (CSE)	t	2026-03-16 23:15:12.549004
6	System Admin	admin@canteen.com	0000000000	admin	2026-03-11 23:18:53.782852	2026-03-16 23:04:08.10387	admin	$2a$10$J/P4eDJAsH0FUYt.A7sXye6Z3f1TEaD5AoHdxuUugDvdOJxciHQv2	\N	\N	t	2026-03-16 23:04:08.10387
\.


--
-- Data for Name: vendor_activity; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.vendor_activity (activity_id, vendor_id, order_id, action, result, notes, created_at) FROM stdin;
\.


--
-- Name: inventory_inventory_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.inventory_inventory_id_seq', 38, true);


--
-- Name: items_item_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.items_item_id_seq', 19, true);


--
-- Name: order_items_order_item_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.order_items_order_item_id_seq', 21, true);


--
-- Name: orders_order_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.orders_order_id_seq', 12, true);


--
-- Name: payments_payment_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.payments_payment_id_seq', 11, true);


--
-- Name: sessions_session_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.sessions_session_id_seq', 1, false);


--
-- Name: users_user_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_user_id_seq', 8, true);


--
-- Name: vendor_activity_activity_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.vendor_activity_activity_id_seq', 1, false);


--
-- Name: inventory inventory_item_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inventory
    ADD CONSTRAINT inventory_item_id_key UNIQUE (item_id);


--
-- Name: inventory inventory_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inventory
    ADD CONSTRAINT inventory_pkey PRIMARY KEY (inventory_id);


--
-- Name: items items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.items
    ADD CONSTRAINT items_pkey PRIMARY KEY (item_id);


--
-- Name: order_items order_items_order_id_item_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_order_id_item_id_key UNIQUE (order_id, item_id);


--
-- Name: order_items order_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_pkey PRIMARY KEY (order_item_id);


--
-- Name: orders orders_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_pkey PRIMARY KEY (order_id);


--
-- Name: payments payments_order_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_order_id_key UNIQUE (order_id);


--
-- Name: payments payments_payment_ref_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_payment_ref_key UNIQUE (payment_ref);


--
-- Name: payments payments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_pkey PRIMARY KEY (payment_id);


--
-- Name: sessions sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (session_id);


--
-- Name: sessions sessions_token_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_token_key UNIQUE (token);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (user_id);


--
-- Name: users users_username_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);


--
-- Name: vendor_activity vendor_activity_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vendor_activity
    ADD CONSTRAINT vendor_activity_pkey PRIMARY KEY (activity_id);


--
-- Name: idx_inventory_available; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_inventory_available ON public.inventory USING btree (available_quantity);


--
-- Name: idx_inventory_item; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_inventory_item ON public.inventory USING btree (item_id);


--
-- Name: idx_inventory_low_stock; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_inventory_low_stock ON public.inventory USING btree (stock_quantity) WHERE (stock_quantity <= low_stock_threshold);


--
-- Name: idx_items_available; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_items_available ON public.items USING btree (is_available);


--
-- Name: idx_items_category; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_items_category ON public.items USING btree (category);


--
-- Name: idx_order_items_item; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_order_items_item ON public.order_items USING btree (item_id);


--
-- Name: idx_order_items_order; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_order_items_order ON public.order_items USING btree (order_id);


--
-- Name: idx_orders_created; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_orders_created ON public.orders USING btree (created_at);


--
-- Name: idx_orders_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_orders_status ON public.orders USING btree (status);


--
-- Name: idx_orders_user; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_orders_user ON public.orders USING btree (user_id);


--
-- Name: idx_payments_order; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_payments_order ON public.payments USING btree (order_id);


--
-- Name: idx_payments_ref; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_payments_ref ON public.payments USING btree (payment_ref);


--
-- Name: idx_payments_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_payments_status ON public.payments USING btree (status);


--
-- Name: idx_sessions_expires; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_sessions_expires ON public.sessions USING btree (expires_at);


--
-- Name: idx_sessions_token; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_sessions_token ON public.sessions USING btree (token);


--
-- Name: idx_sessions_user; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_sessions_user ON public.sessions USING btree (user_id);


--
-- Name: idx_users_email; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_users_email ON public.users USING btree (email);


--
-- Name: idx_users_is_active; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_users_is_active ON public.users USING btree (is_active);


--
-- Name: idx_users_role; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_users_role ON public.users USING btree (role);


--
-- Name: idx_users_username; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_users_username ON public.users USING btree (username);


--
-- Name: idx_vendor_activity_created; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_vendor_activity_created ON public.vendor_activity USING btree (created_at);


--
-- Name: idx_vendor_activity_order; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_vendor_activity_order ON public.vendor_activity USING btree (order_id);


--
-- Name: idx_vendor_activity_vendor; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_vendor_activity_vendor ON public.vendor_activity USING btree (vendor_id);


--
-- Name: inventory trigger_update_inventory_timestamp; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trigger_update_inventory_timestamp BEFORE UPDATE ON public.inventory FOR EACH ROW EXECUTE FUNCTION public.update_inventory_timestamp();


--
-- Name: items update_items_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_items_updated_at BEFORE UPDATE ON public.items FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: orders update_orders_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: users update_users_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: inventory inventory_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inventory
    ADD CONSTRAINT inventory_item_id_fkey FOREIGN KEY (item_id) REFERENCES public.items(item_id) ON DELETE CASCADE;


--
-- Name: order_items order_items_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_item_id_fkey FOREIGN KEY (item_id) REFERENCES public.items(item_id) ON DELETE CASCADE;


--
-- Name: order_items order_items_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(order_id) ON DELETE CASCADE;


--
-- Name: orders orders_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- Name: payments payments_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(order_id) ON DELETE CASCADE;


--
-- Name: sessions sessions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- Name: vendor_activity vendor_activity_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vendor_activity
    ADD CONSTRAINT vendor_activity_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(order_id) ON DELETE CASCADE;


--
-- Name: vendor_activity vendor_activity_vendor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vendor_activity
    ADD CONSTRAINT vendor_activity_vendor_id_fkey FOREIGN KEY (vendor_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict b9A0LYRCDmfXwAyQpVc25Sig3QzXS9eMwnrokVoCbZWtoJhujNwf8LGqgAuxqQE

