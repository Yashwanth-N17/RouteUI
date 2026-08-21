export interface ExpressRouteLayer {
  name: string;
  method?: string;
}

export interface ExpressRoute {
  path: string | string[];
  methods: Record<string, boolean>;
  stack: ExpressRouteLayer[];
}

export interface ExpressLayer {
  name?: string;
  route?: ExpressRoute;

  handle?: {
    stack?: ExpressLayer[];
  };

  path?: string | string[];
  keys?: Array<{ name: string | number }>;
  regexp?: RegExp;
}
